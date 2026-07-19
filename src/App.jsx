import React, { useEffect, useRef, useState } from "react";
import {
  GitHubRateLimitError,
  searchRepositories,
  surpriseRepository,
} from "./api/github.js";
import CategoryChips from "./components/CategoryChips.jsx";
import RateLimitNotice from "./components/RateLimitNotice.jsx";
import RepoCard from "./components/RepoCard.jsx";
import SearchBar from "./components/SearchBar.jsx";
import StarBandToggle from "./components/StarBandToggle.jsx";
import SurpriseButton from "./components/SurpriseButton.jsx";
import ThirtyMinButton from "./components/ThirtyMinButton.jsx";
import TokenSettings from "./components/TokenSettings.jsx";

const TOKEN_STORAGE_KEY = "github-treasure-hunt.token.v1";

function readStoredToken() {
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export default function App() {
  const [filters, setFilters] = useState({
    category: "",
    starBand: "",
    text: "",
    thirtyMin: false,
  });
  const [repositories, setRepositories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [rateLimitUntil, setRateLimitUntil] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [token, setToken] = useState(readStoredToken);
  const surpriseDice = useRef(null);

  function handleFailure(error) {
    setRepositories([]);

    if (error instanceof GitHubRateLimitError) {
      setRateLimitUntil(error.resetAt);
      setMessage("");
      return;
    }

    setMessage("GitHub is taking a breather. Please try again shortly.");
  }

  useEffect(() => {
    const activeFilters = {
      ...filters,
      text: filters.text.trim(),
    };
    const hasActiveFilters =
      activeFilters.text ||
      activeFilters.category ||
      activeFilters.starBand ||
      activeFilters.thirtyMin;

    if (!hasActiveFilters) {
      setRepositories([]);
      setMessage("");
      setIsLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setIsLoading(true);
      setMessage("");

      try {
        const result = await searchRepositories(
          activeFilters,
          { signal: controller.signal, token },
        );
        const items = filters.thirtyMin
          ? result.items.filter((repository) => repository.description)
          : result.items;
        setRepositories(items);
        setMessage(
          items.length === 0
            ? "No gems here — try a different search."
            : "",
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          handleFailure(error);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, 400);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [
    filters.category,
    filters.starBand,
    filters.text,
    filters.thirtyMin,
    token,
  ]);

  function updateFilter(name, value) {
    surpriseDice.current = null;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  async function handleSurprise() {
    setIsLoading(true);
    setMessage("");

    try {
      const result = await surpriseRepository(filters, {
        dice: surpriseDice.current,
        token,
      });
      surpriseDice.current = result.dice;
      setRepositories(result.repository ? [result.repository] : []);
      setMessage(result.message);
    } catch (error) {
      handleFailure(error);
    } finally {
      setIsLoading(false);
    }
  }

  function saveToken(value) {
    const nextToken = value.trim();

    try {
      if (nextToken) {
        window.localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
      } else {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    } catch {
      setMessage("This browser could not save that setting.");
      return;
    }

    setToken(nextToken);
    setSettingsOpen(false);
  }

  return (
    <main className="treasure-shell">
      <header className="treasure-header">
        <h1>
          <span>GitHub</span>
          <span>Treasure Hunt</span>
        </h1>
      </header>

      <SearchBar
        value={filters.text}
        onChange={(value) => updateFilter("text", value)}
      />

      <div className="filter-stack">
        <CategoryChips
          value={filters.category}
          onChange={(value) => updateFilter("category", value)}
        />
        <StarBandToggle
          value={filters.starBand}
          onChange={(value) => updateFilter("starBand", value)}
        />
        <div className="action-row">
          <ThirtyMinButton
            active={filters.thirtyMin}
            onChange={(value) => updateFilter("thirtyMin", value)}
          />
          <SurpriseButton disabled={isLoading} onClick={handleSurprise} />
          <button
            className="settings-link"
            onClick={() => setSettingsOpen(true)}
            type="button"
          >
            Settings
          </button>
        </div>
      </div>

      <RateLimitNotice until={rateLimitUntil} />

      <section aria-busy={isLoading} aria-live="polite" className="results-list">
        {isLoading ? <p className="status-message">Searching GitHub…</p> : null}
        {!isLoading && message ? (
          <p className="status-message">{message}</p>
        ) : null}
        {!isLoading && repositories.length > 0 ? (
          <h2 className="sr-only">Repository results</h2>
        ) : null}
        <div className="repository-stack">
          {repositories.map((repository) => (
            <RepoCard key={repository.id} repository={repository} />
          ))}
        </div>
      </section>

      <TokenSettings
        open={settingsOpen}
        token={token}
        onClose={() => setSettingsOpen(false)}
        onSave={saveToken}
      />
    </main>
  );
}

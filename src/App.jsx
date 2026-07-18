import React, { useEffect, useRef, useState } from "react";
import {
  searchRepositories,
  surpriseRepository,
} from "./api/github.js";
import CategoryChips from "./components/CategoryChips.jsx";
import RepoCard from "./components/RepoCard.jsx";
import SearchBar from "./components/SearchBar.jsx";
import StarBandToggle from "./components/StarBandToggle.jsx";
import SurpriseButton from "./components/SurpriseButton.jsx";
import ThirtyMinButton from "./components/ThirtyMinButton.jsx";

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
  const surpriseDice = useRef(null);

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
          { signal: controller.signal },
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
          setRepositories([]);
          setMessage("GitHub is taking a breather. Please try again shortly.");
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
      });
      surpriseDice.current = result.dice;
      setRepositories(result.repository ? [result.repository] : []);
      setMessage(result.message);
    } catch {
      setRepositories([]);
      setMessage("GitHub is taking a breather. Please try again shortly.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-5 pb-16 pt-20 sm:px-8 sm:pt-24">
      <h1 className="text-center text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
        GitHub <span className="text-blue-600">Treasure Hunt</span>
      </h1>

      <SearchBar
        value={filters.text}
        onChange={(value) => updateFilter("text", value)}
      />

      <div className="mt-6 space-y-6">
        <CategoryChips
          value={filters.category}
          onChange={(value) => updateFilter("category", value)}
        />
        <StarBandToggle
          value={filters.starBand}
          onChange={(value) => updateFilter("starBand", value)}
        />
        <ThirtyMinButton
          active={filters.thirtyMin}
          onChange={(value) => updateFilter("thirtyMin", value)}
        />
        <SurpriseButton disabled={isLoading} onClick={handleSurprise} />
      </div>

      <section aria-busy={isLoading} aria-live="polite" className="mt-10">
        {isLoading ? (
          <p className="text-center text-sm text-slate-600">
            Searching GitHub…
          </p>
        ) : null}
        {!isLoading && message ? (
          <p className="text-center text-sm text-slate-600">{message}</p>
        ) : null}
        {!isLoading && repositories.length > 0 ? (
          <h2 className="sr-only">Repository results</h2>
        ) : null}
        <div className="space-y-4">
          {repositories.map((repository) => (
            <RepoCard key={repository.id} repository={repository} />
          ))}
        </div>
      </section>
    </main>
  );
}

import React, { useEffect, useState } from "react";
import { searchRepositories } from "./api/github.js";
import RepoCard from "./components/RepoCard.jsx";
import SearchBar from "./components/SearchBar.jsx";

export default function App() {
  const [text, setText] = useState("");
  const [repositories, setRepositories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const trimmedText = text.trim();

    if (!trimmedText) {
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
          { text: trimmedText },
          { signal: controller.signal },
        );
        setRepositories(result.items);
        setMessage(
          result.items.length === 0
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
  }, [text]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-5 pb-16 pt-20 sm:px-8 sm:pt-24">
      <h1 className="text-center text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
        GitHub <span className="text-blue-600">Treasure Hunt</span>
      </h1>

      <SearchBar value={text} onChange={setText} />

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

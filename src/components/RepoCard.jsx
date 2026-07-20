import React, { useState } from "react";

const relativeTime = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function humanizeDate(value) {
  const elapsedSeconds = (new Date(value).getTime() - Date.now()) / 1000;
  const ranges = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [30, "day"],
    [12, "month"],
    [Number.POSITIVE_INFINITY, "year"],
  ];
  let duration = elapsedSeconds;

  for (const [limit, unit] of ranges) {
    if (Math.abs(duration) < limit) {
      return relativeTime.format(Math.round(duration), unit);
    }
    duration /= limit;
  }

  return relativeTime.format(Math.round(duration), "year");
}

export default function RepoCard({ repository }) {
  const [shareStatus, setShareStatus] = useState("");

  async function shareRepository() {
    const shareData = {
      title: `${repository.full_name} — GitHub Treasure Hunt`,
      text: `A GitHub Treasure Hunt find: ${repository.full_name}${
        repository.description ? ` — ${repository.description}` : ""
      }`,
      url: repository.html_url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareStatus("Shared");
      } else {
        await navigator.clipboard.writeText(repository.html_url);
        setShareStatus("Link copied");
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        setShareStatus("Could not copy link");
      }
    }
  }

  return (
    <article className="repository-card">
      <div className="repository-heading">
        <h3>{repository.full_name}</h3>
        <span className="star-count">
          <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
            <path d="m12 3 2.75 5.6 6.18.9-4.47 4.35 1.05 6.15L12 17.1 6.49 20l1.05-6.15L3.07 9.5l6.18-.9L12 3Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
          {repository.stargazers_count.toLocaleString()}
        </span>
      </div>

      <p className="repository-description">
        {repository.description || "No description provided."}
      </p>

      <div className="repository-meta">
        <span>{repository.language || "Unknown language"}</span>
        <span aria-hidden="true" className="meta-separator">•</span>
        <span>Updated {humanizeDate(repository.pushed_at)}</span>
        <button
          aria-label={`Share ${repository.full_name}`}
          className="repository-share"
          onClick={shareRepository}
          type="button"
        >
          <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
            <path d="M8 12.5 16 8m-8 3.5L16 16M18.5 9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm0 11a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM5.5 15a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
          {shareStatus || "Share"}
        </button>
        <span aria-live="polite" className="sr-only">{shareStatus}</span>
        <a
          className="repository-link"
          href={repository.html_url}
          rel="noreferrer"
          target="_blank"
        >
          Open Repository
          <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
            <path d="M14 4h6v6M20 4l-9 9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
            <path d="M19 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
          </svg>
        </a>
      </div>
    </article>
  );
}

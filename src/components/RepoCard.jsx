import React from "react";

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

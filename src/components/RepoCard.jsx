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
    <article className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="min-w-0 break-words text-lg font-semibold text-blue-600">
          {repository.full_name}
        </h3>
        <span className="shrink-0 text-sm text-slate-600">
          ⭐ {repository.stargazers_count.toLocaleString()}
        </span>
      </div>

      <p className="mt-3 leading-7 text-slate-700">
        {repository.description || "No description provided."}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
        <span>{repository.language || "Unknown language"}</span>
        <span>Updated {humanizeDate(repository.pushed_at)}</span>
        <a
          className="ml-auto rounded text-blue-600 underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
          href={repository.html_url}
          rel="noreferrer"
          target="_blank"
        >
          Open Repository
        </a>
      </div>
    </article>
  );
}

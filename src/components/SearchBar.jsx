import React from "react";

export default function SearchBar({ value, onChange }) {
  return (
    <form
      className="mt-8 w-full sm:mt-9"
      role="search"
      onSubmit={(event) => event.preventDefault()}
    >
      <label className="relative block" htmlFor="repo-search">
        <span className="sr-only">Search open-source repositories</span>
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="m16.25 16.25 4 4"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
        </svg>
        <input
          autoComplete="off"
          className="h-14 w-full rounded-xl border border-slate-300 bg-white pl-12 pr-5 text-base text-slate-950 shadow-sm outline-none transition placeholder:text-slate-500 hover:border-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          id="repo-search"
          name="search"
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search open-source gems"
          type="search"
          value={value}
        />
      </label>
    </form>
  );
}

import React from "react";

export default function SearchBar({ value, onChange }) {
  return (
    <form className="mt-10 w-full" role="search" onSubmit={(event) => event.preventDefault()}>
      <label htmlFor="repo-search">
        <span className="sr-only">Search open-source repositories</span>
        <input
          autoComplete="off"
          className="h-14 w-full rounded-xl border border-slate-300 bg-white px-5 text-base text-slate-950 shadow-sm outline-none transition placeholder:text-slate-500 hover:border-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
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

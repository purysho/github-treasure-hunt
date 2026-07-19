import React from "react";

export default function SearchBar({ value, onChange }) {
  return (
    <form
      className="search-form"
      role="search"
      onSubmit={(event) => event.preventDefault()}
    >
      <label className="search-field" htmlFor="repo-search">
        <span className="sr-only">Search open-source repositories</span>
        <svg
          aria-hidden="true"
          className="search-icon"
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
          className="search-input"
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

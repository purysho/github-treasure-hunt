import React from "react";

export default function SurpriseButton({ disabled, onClick }) {
  return (
    <button
      aria-label="Surprise me with a repository"
      className="surprise-button"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
        <path d="m12 2.75 7.5 4.35v8.65L12 20.1l-7.5-4.35V7.1L12 2.75Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
        <circle cx="9" cy="8.5" fill="currentColor" r="1" />
        <circle cx="15" cy="9.5" fill="currentColor" r="1" />
        <circle cx="10" cy="14.5" fill="currentColor" r="1" />
        <circle cx="15.5" cy="15" fill="currentColor" r="1" />
      </svg>
      Surprise Me
    </button>
  );
}

import React from "react";

export default function ThirtyMinButton({ active, onChange }) {
  return (
    <button
      aria-pressed={active}
      className={`time-button${active ? " is-active" : ""}`}
      onClick={() => onChange(!active)}
      type="button"
    >
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 7.5V12l3 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      </svg>
      I have 30 minutes
    </button>
  );
}

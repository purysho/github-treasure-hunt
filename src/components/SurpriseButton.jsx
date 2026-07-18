import React from "react";

export default function SurpriseButton({ disabled, onClick }) {
  return (
    <button
      aria-label="Surprise me with a repository"
      className="w-full rounded-lg bg-blue-600 px-5 py-3 text-base font-semibold text-white outline-none transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      🎲 Surprise Me
    </button>
  );
}

import React from "react";

export default function ThirtyMinButton({ active, onChange }) {
  return (
    <button
      aria-pressed={active}
      className={`w-full rounded-lg border px-4 py-3 text-sm font-semibold outline-none transition focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
        active
          ? "border-blue-600 bg-blue-50 text-blue-700"
          : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
      }`}
      onClick={() => onChange(!active)}
      type="button"
    >
      I have 30 minutes
    </button>
  );
}

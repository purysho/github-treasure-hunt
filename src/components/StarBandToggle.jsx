import React from "react";

const starBands = [
  ["Any", ""],
  ["Under 100", "<100"],
  ["100–500", "100..500"],
  ["500–1000", "500..1000"],
];

export default function StarBandToggle({ value, onChange }) {
  return (
    <fieldset className="sm:flex sm:items-center sm:gap-4">
      <legend className="mb-3 text-sm font-semibold text-slate-900 sm:mb-0 sm:w-28 sm:shrink-0">
        Hidden Gems
      </legend>
      <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4">
        {starBands.map(([label, band]) => (
          <label className="relative" key={label}>
            <input
              checked={value === band}
              className="peer sr-only"
              name="star-band"
              onChange={() => onChange(band)}
              type="radio"
              value={band}
            />
            <span className="flex min-h-10 cursor-pointer items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-center text-sm font-medium text-slate-700 transition hover:border-slate-400 peer-checked:border-blue-600 peer-checked:bg-blue-50 peer-checked:text-blue-700 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-600 peer-focus-visible:ring-offset-2">
              {label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

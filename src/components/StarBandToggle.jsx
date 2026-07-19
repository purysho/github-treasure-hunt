import React from "react";

const starBands = [
  ["Any", ""],
  ["Under 100", "<100"],
  ["100–500", "100..500"],
  ["500–1000", "500..1000"],
];

export default function StarBandToggle({ value, onChange }) {
  return (
    <fieldset className="star-filter">
      <legend>Hidden Gems</legend>
      <div className="star-band-grid">
        {starBands.map(([label, band]) => (
          <label className="star-band-option" key={label}>
            <input
              checked={value === band}
              className="sr-only"
              name="star-band"
              onChange={() => onChange(band)}
              type="radio"
              value={band}
            />
            <span>
              {label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

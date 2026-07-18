import React from "react";

const categories = [
  ["🤖 AI", "ai"],
  ["🧠 Machine Learning", "machine-learning"],
  ["🎨 Design", "design"],
  ["🌍 Climate", "climate"],
  ["🔒 Security", "security"],
  ["🎮 Games", "game"],
  ["📚 Education", "education"],
  ["🛠 Developer Tools", "developer-tools"],
  ["📱 Mobile", "mobile"],
  ["🌐 Web", "web"],
  ["📊 Data Science", "data-science"],
];

export default function CategoryChips({ value, onChange }) {
  return (
    <section aria-labelledby="category-label">
      <h2 className="sr-only" id="category-label">
        Categories
      </h2>
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map(([label, slug]) => {
          const selected = value === slug;

          return (
            <button
              aria-pressed={selected}
              className={`rounded-lg border px-3 py-2 text-sm font-medium outline-none transition focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                selected
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
              }`}
              key={slug}
              onClick={() => onChange(selected ? "" : slug)}
              type="button"
            >
              {label}
            </button>
          );
        })}
      </div>
    </section>
  );
}

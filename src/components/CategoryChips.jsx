import React from "react";

const categories = [
  ["AI", "ai"],
  ["Machine Learning", "machine-learning"],
  ["Design", "design"],
  ["Climate", "climate"],
  ["Security", "security"],
  ["Games", "game"],
  ["Education", "education"],
  ["Developer Tools", "developer-tools"],
  ["Mobile", "mobile"],
  ["Web", "web"],
  ["Data Science", "data-science"],
];

function CategoryIcon({ name }) {
  const common = {
    "aria-hidden": true,
    className: "category-icon",
    fill: "none",
    viewBox: "0 0 24 24",
  };

  if (name === "ai") {
    return (
      <svg {...common}>
        <path d="M12 2.75 13.4 8.6 19.25 10 13.4 11.4 12 17.25l-1.4-5.85L4.75 10l5.85-1.4L12 2.75Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="m18.5 15 .65 2.85L22 18.5l-2.85.65L18.5 22l-.65-2.85L15 18.5l2.85-.65L18.5 15Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
      </svg>
    );
  }

  if (name === "machine-learning") {
    return (
      <svg {...common}>
        <path d="M9.5 5.1A3.5 3.5 0 0 0 3 7a3.6 3.6 0 0 0 1.05 2.55A4 4 0 0 0 6.5 16.6 3.5 3.5 0 0 0 12 19V5.5A3 3 0 0 0 9.5 5.1Zm5 0A3.5 3.5 0 0 1 21 7a3.6 3.6 0 0 1-1.05 2.55 4 4 0 0 1-2.45 7.05A3.5 3.5 0 0 1 12 19V5.5a3 3 0 0 1 2.5-.4Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M8 8.5a2.4 2.4 0 0 0 4 1.8m4-1.8a2.4 2.4 0 0 1-4 1.8M8.5 14a3.3 3.3 0 0 0 3.5-1.3m3.5 1.3a3.3 3.3 0 0 1-3.5-1.3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
      </svg>
    );
  }

  if (name === "design") {
    return (
      <svg {...common}>
        <path d="m4 20 3.8-10.7L15.5 3l5.5 5.5-6.3 7.7L4 20Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="m7.8 9.3 6.9 6.9M4 20l6.35-6.35M15.5 3l-1 4.5L21 8.5" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
      </svg>
    );
  }

  if (name === "climate") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 3.5c2.1 2.3 3.2 5.1 3.2 8.5S14.1 18.2 12 20.5M12 3.5C9.9 5.8 8.8 8.6 8.8 12s1.1 6.2 3.2 8.5M4 12h16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
      </svg>
    );
  }

  if (name === "security") {
    return (
      <svg {...common}>
        <path d="M12 2.75 19 5.5v5.65c0 4.4-2.8 7.9-7 10.1-4.2-2.2-7-5.7-7-10.1V5.5l7-2.75Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
      </svg>
    );
  }

  if (name === "game") {
    return (
      <svg {...common}>
        <path d="M7.1 7h9.8c2 0 3.45 1.3 3.8 3.25l1 5.35a2.7 2.7 0 0 1-4.8 2.1l-1.5-2.2H8.6l-1.5 2.2a2.7 2.7 0 0 1-4.8-2.1l1-5.35A3.8 3.8 0 0 1 7.1 7Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M7.5 10v4m-2-2h4m6.5-1.5h.01m2 3h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </svg>
    );
  }

  if (name === "education") {
    return (
      <svg {...common}>
        <path d="M3.5 5.5h5A3.5 3.5 0 0 1 12 9v10a3.5 3.5 0 0 0-3.5-3.5h-5v-10Zm17 0h-5A3.5 3.5 0 0 0 12 9v10a3.5 3.5 0 0 1 3.5-3.5h5v-10Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
      </svg>
    );
  }

  if (name === "developer-tools") {
    return (
      <svg {...common}>
        <path d="m14.4 5.6 4-2a4.5 4.5 0 0 1-5.8 5.8L5 17a1.4 1.4 0 0 0 2 2l7.6-7.6a4.5 4.5 0 0 0 5.8-5.8l-2 4-4-4Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="m4 4 5.5 5.5M3 3l1 3 2-2-3-1Zm12 12 5 5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      </svg>
    );
  }

  if (name === "mobile") {
    return (
      <svg {...common}>
        <rect width="10" height="18" x="7" y="3" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10.5 6h3M11 18h2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
      </svg>
    );
  }

  if (name === "web") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3.8 9h16.4M3.8 15h16.4M12 3.5c2 2.35 3 5.2 3 8.5s-1 6.15-3 8.5c-2-2.35-3-5.2-3-8.5s1-6.15 3-8.5Z" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M4 20V11h3v9H4Zm6 0V4h3v16h-3Zm6 0V8h3v12h-3Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  );
}

export default function CategoryChips({ value, onChange }) {
  return (
    <section aria-labelledby="category-label">
      <h2 className="sr-only" id="category-label">
        Categories
      </h2>
      <div className="category-grid">
        {categories.map(([label, slug]) => {
          const selected = value === slug;

          return (
            <button
              aria-pressed={selected}
              className={`category-chip${selected ? " is-selected" : ""}`}
              key={slug}
              onClick={() => onChange(selected ? "" : slug)}
              type="button"
            >
              <CategoryIcon name={slug} />
              {label}
            </button>
          );
        })}
      </div>
    </section>
  );
}

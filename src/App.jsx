import React from "react";

export default function App() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center px-5 pt-24 sm:px-8 sm:pt-32">
      <h1 className="text-center text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
        GitHub <span className="text-blue-600">Treasure Hunt</span>
      </h1>

      <label className="mt-10 w-full" htmlFor="repo-search">
        <span className="sr-only">Search open-source repositories</span>
        <input
          className="h-14 w-full rounded-xl border border-slate-300 bg-white px-5 text-base text-slate-950 shadow-sm outline-none transition placeholder:text-slate-500 hover:border-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          id="repo-search"
          name="search"
          placeholder="Search open-source gems"
          type="search"
        />
      </label>
    </main>
  );
}

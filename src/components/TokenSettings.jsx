import React, { useEffect, useRef, useState } from "react";

export default function TokenSettings({ open, token, onClose, onSave }) {
  const [draft, setDraft] = useState(token);
  const dialog = useRef(null);
  const tokenInput = useRef(null);

  useEffect(() => {
    if (open) {
      setDraft(token);
      dialog.current?.showModal();
      tokenInput.current?.focus();
    }
  }, [open, token]);

  if (!open) return null;

  return (
    <dialog
      aria-modal="true"
      aria-labelledby="token-settings-title"
      className="fixed inset-0 z-10 m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-slate-200 bg-white p-0 text-slate-950 shadow-xl backdrop:bg-slate-950/30"
      onCancel={onClose}
      ref={dialog}
    >
      <form
        className="p-6"
        onSubmit={(event) => {
          event.preventDefault();
          onSave(draft);
        }}
      >
        <h2 className="text-xl font-semibold" id="token-settings-title">
          GitHub API settings
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Add your own fine-grained, public read-only PAT for a higher search
          limit. It stays only in this browser.
        </p>

        <label className="mt-5 block text-sm font-semibold" htmlFor="token">
          Personal access token
        </label>
        <input
          autoComplete="off"
          className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          id="token"
          onChange={(event) => setDraft(event.target.value)}
          ref={tokenInput}
          type="password"
          value={draft}
        />

        <div className="mt-6 flex justify-end gap-3">
          <button
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 outline-none hover:border-slate-400 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white outline-none hover:bg-blue-700 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            type="submit"
          >
            Save
          </button>
        </div>
      </form>
    </dialog>
  );
}

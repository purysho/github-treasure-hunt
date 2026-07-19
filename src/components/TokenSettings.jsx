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
      className="settings-dialog"
      onCancel={onClose}
      ref={dialog}
    >
      <form
        className="settings-form"
        onSubmit={(event) => {
          event.preventDefault();
          onSave(draft);
        }}
      >
        <h2 id="token-settings-title">
          GitHub API settings
        </h2>
        <p className="settings-copy">
          Add your own fine-grained, public read-only PAT for a higher search
          limit. It stays only in this browser.
        </p>

        <label className="settings-label" htmlFor="token">
          Personal access token
        </label>
        <input
          autoComplete="off"
          className="settings-input"
          id="token"
          onChange={(event) => setDraft(event.target.value)}
          ref={tokenInput}
          type="password"
          value={draft}
        />

        <div className="settings-actions">
          <button
            className="dialog-button dialog-button-secondary"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="dialog-button dialog-button-primary"
            type="submit"
          >
            Save
          </button>
        </div>
      </form>
    </dialog>
  );
}

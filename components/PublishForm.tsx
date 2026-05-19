'use client';

import { useState, type FormEvent } from 'react';

interface PublishFormProps {
  onPublish: (input: {
    displayName?: string;
    showInLeaderboard: boolean;
  }) => Promise<void>;
}

export function PublishForm({ onPublish }: PublishFormProps) {
  const [name, setName] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    const trimmed = name.trim();
    if (show && trimmed.length === 0) {
      setError('Введите имя, чтобы попасть в лидерборд.');
      return;
    }
    setBusy(true);
    try {
      await onPublish({
        displayName: trimmed.length > 0 ? trimmed : undefined,
        showInLeaderboard: show,
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Не удалось опубликовать. Попробуйте ещё раз.';
      setError(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 bg-surface border border-border rounded-md p-5 shadow-card"
    >
      <h2 className="text-lg font-semibold">Опубликовать результат</h2>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">
          Имя для лидерборда (необязательно)
        </span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
          disabled={busy}
          className="px-3 py-2 rounded-md border border-border bg-bg text-text disabled:opacity-50"
          aria-describedby={error ? 'publish-error' : undefined}
        />
      </label>

      <label className="flex items-center gap-2 select-none">
        <input
          type="checkbox"
          checked={show}
          onChange={(e) => setShow(e.target.checked)}
          disabled={busy}
          className="w-4 h-4 accent-primary"
        />
        <span className="text-sm">Показывать в публичном лидерборде</span>
      </label>

      {error && (
        <p id="publish-error" role="alert" className="text-danger text-sm">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="self-start px-6 py-3 rounded-md font-semibold bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:bg-primary/90"
      >
        {busy ? 'Публикуем…' : 'Опубликовать'}
      </button>
    </form>
  );
}

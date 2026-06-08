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
      setError('Введите имя, чтобы попасть в рейтинг');
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      <h2 className="text-xl font-bold">Опубликовать результат</h2>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Имя для рейтинга</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
          disabled={busy}
          className="px-3 py-2 rounded-sm border border-border-selector bg-background-display text-text-primary disabled:opacity-50"
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
        <span className="text-sm">Показывать в публичном рейтинге</span>
      </label>

      {error && (
        <p id="publish-error" role="alert" className="text-text-accent text-sm">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="self-start px-6 py-3 rounded-xs font-semibold bg-button-primary text-text-inverse disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:bg-button-primary-hover"
      >
        {busy ? 'Публикуем…' : 'Опубликовать'}
      </button>
    </form>
  );
}

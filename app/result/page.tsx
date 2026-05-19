'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ResultScreen } from '../../components/ResultScreen';
import type { SessionResult } from '../../lib/types';

const RESULT_KEY = 'aiq_session_result';

type LoadState =
  | { kind: 'pending' }
  | { kind: 'missing' }
  | { kind: 'invalid' }
  | { kind: 'ready'; session: SessionResult };

function isValidSession(value: unknown): value is SessionResult {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  if (typeof v.aiq !== 'number') return false;
  if (!['paranoid', 'trusting', 'balanced'].includes(v.biasProfile as string)) return false;
  if (!v.modalityScores || typeof v.modalityScores !== 'object') return false;
  const ms = v.modalityScores as Record<string, unknown>;
  for (const m of ['text', 'image', 'video', 'audio']) {
    if (typeof ms[m] !== 'number') return false;
  }
  if (!Array.isArray(v.rounds)) return false;
  if (v.publication !== undefined && v.publication !== null) {
    if (typeof v.publication !== 'object') return false;
    const p = v.publication as Record<string, unknown>;
    if (typeof p.resultId !== 'string') return false;
    if (p.percentile !== null && typeof p.percentile !== 'number') return false;
    if (typeof p.totalResults !== 'number') return false;
  }
  return true;
}

export default function ResultPage() {
  const [state, setState] = useState<LoadState>({ kind: 'pending' });

  useEffect(() => {
    const raw = sessionStorage.getItem(RESULT_KEY);
    if (!raw) {
      setState({ kind: 'missing' });
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      if (isValidSession(parsed)) {
        setState({ kind: 'ready', session: parsed });
      } else {
        setState({ kind: 'invalid' });
      }
    } catch {
      setState({ kind: 'invalid' });
    }
  }, []);

  if (state.kind === 'pending') return <div aria-hidden="true" />;

  if (state.kind === 'ready') return <ResultScreen session={state.session} />;

  return (
    <main className="mx-auto w-full max-w-[600px] flex flex-col items-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-bold">Нет результата</h1>
      <p className="text-muted">Сначала пройдите тест.</p>
      <Link
        href="/test"
        className="px-5 py-3 rounded-md bg-primary text-white font-semibold"
      >
        Пройти тест
      </Link>
    </main>
  );
}

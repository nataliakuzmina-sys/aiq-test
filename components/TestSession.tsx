'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type {
  PublicPair,
  RoundSubmission,
  SessionResult,
} from '../lib/types';
import { TestRound } from './TestRound';

interface TestSessionProps {
  initialPairs: PublicPair[];
}

type Phase = 'check' | 'active' | 'blocked' | 'finalizing';

const ANTI_CHEAT_WINDOW_MS = 24 * 60 * 60 * 1000;
const COMPLETED_KEY = 'aiq_completed_at';
const RESULT_KEY = 'aiq_session_result';

export function TestSession({ initialPairs }: TestSessionProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('check');
  const [roundIndex, setRoundIndex] = useState(0);
  const [submissions, setSubmissions] = useState<RoundSubmission[]>([]);

  useEffect(() => {
    // Dev-only: ?reset=1 чистит лимит + sessionStorage и убирает параметр из URL.
    // На production-сборке Next.js статически заменяет NODE_ENV — этот блок
    // становится мёртвым кодом и в клиентский бандл не попадает.
    if (process.env.NODE_ENV !== 'production') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('reset') === '1') {
        localStorage.removeItem(COMPLETED_KEY);
        sessionStorage.removeItem(RESULT_KEY);
        window.history.replaceState(null, '', '/test');
      }
    }
    const completed = localStorage.getItem(COMPLETED_KEY);
    if (completed) {
      const elapsed = Date.now() - Number(completed);
      if (Number.isFinite(elapsed) && elapsed < ANTI_CHEAT_WINDOW_MS) {
        setPhase('blocked');
        return;
      }
    }
    setPhase('active');
  }, []);

  function handleRoundComplete(submission: RoundSubmission) {
    const next = [...submissions, submission];
    if (next.length < initialPairs.length) {
      setSubmissions(next);
      setRoundIndex((i) => i + 1);
      return;
    }
    void finalize(next);
  }

  async function finalize(rounds: RoundSubmission[]) {
    setPhase('finalizing');
    try {
      const res = await fetch('/api/finish-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rounds }),
      });
      if (!res.ok) {
        throw new Error('Не удалось завершить сессию');
      }
      const session: SessionResult = await res.json();
      sessionStorage.setItem(RESULT_KEY, JSON.stringify(session));
      localStorage.setItem(COMPLETED_KEY, String(Date.now()));
      router.replace('/result');
    } catch (err) {
      // На клиенте source/type нет — пересчитать локально нельзя.
      // В этой версии падаем с alert; в дальнейшем можно сделать retry-экран.
      // eslint-disable-next-line no-alert
      alert(
        err instanceof Error
          ? err.message
          : 'Не удалось завершить сессию. Попробуйте обновить страницу.',
      );
      setPhase('active');
    }
  }

  if (phase === 'check' || phase === 'finalizing') {
    return <div aria-hidden="true" />;
  }

  if (phase === 'blocked') {
    return (
      <main className="mx-auto w-full max-w-[600px] flex flex-col items-center gap-6 p-8 text-center">
        <h1 className="text-2xl md:text-3xl font-bold">
          Вы уже прошли тест AIQ сегодня
        </h1>
        <p className="text-text-secondary">
          Загляните завтра — попробуйте свои силы с другой комбинацией вопросов
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="px-5 py-3 rounded-xs bg-button-primary text-text-inverse font-semibold text-center hover:bg-button-primary-hover"
          >
            На главную
          </Link>
          <Link
            href="/leaderboard"
            className="px-5 py-3 rounded-xs border border-border-selector bg-background-display text-text-primary font-semibold text-center hover:bg-background-primary"
          >
            Открыть рейтинг
          </Link>
        </div>
      </main>
    );
  }

  const currentPair = initialPairs[roundIndex];
  if (!currentPair) {
    return <div aria-hidden="true" />;
  }

  return (
    <TestRound
      key={roundIndex}
      pair={currentPair}
      roundIndex={roundIndex}
      totalRounds={initialPairs.length}
      durationSeconds={currentPair.durationSeconds}
      onComplete={handleRoundComplete}
    />
  );
}

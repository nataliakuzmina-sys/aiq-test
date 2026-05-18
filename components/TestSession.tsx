'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  computeAIQ,
  computeBiasProfile,
  computeModalityScores,
} from '../lib/scoring';
import type {
  Modality,
  Pair,
  RoundResult,
  SessionResult,
} from '../lib/types';
import { TestRound } from './TestRound';

interface TestSessionProps {
  initialPairs: Pair[];
}

type Phase = 'check' | 'active' | 'blocked';

const DURATIONS: Record<Modality, number> = {
  text: 45,
  image: 30,
  video: 60,
  audio: 50,
};

const ANTI_CHEAT_WINDOW_MS = 24 * 60 * 60 * 1000;
const COMPLETED_KEY = 'aiq_completed_at';
const RESULT_KEY = 'aiq_session_result';

export function TestSession({ initialPairs }: TestSessionProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('check');
  const [roundIndex, setRoundIndex] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);

  useEffect(() => {
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

  function handleRoundComplete(result: RoundResult) {
    const nextResults = [...results, result];
    if (nextResults.length < initialPairs.length) {
      setResults(nextResults);
      setRoundIndex((i) => i + 1);
      return;
    }
    finalize(nextResults);
  }

  function finalize(rounds: RoundResult[]) {
    const session: SessionResult = {
      rounds,
      aiq: computeAIQ(rounds),
      modalityScores: computeModalityScores(rounds),
      biasProfile: computeBiasProfile(rounds),
    };
    sessionStorage.setItem(RESULT_KEY, JSON.stringify(session));
    localStorage.setItem(COMPLETED_KEY, String(Date.now()));
    router.replace('/result');
  }

  if (phase === 'check') {
    return <div aria-hidden="true" />;
  }

  if (phase === 'blocked') {
    return (
      <main className="mx-auto w-full max-w-[600px] flex flex-col items-center gap-6 p-8 text-center">
        <h1 className="text-2xl md:text-3xl font-bold">
          Вы уже прошли AIQ сегодня
        </h1>
        <p className="text-muted">
          Загляните завтра — попадётся другая комбинация вопросов.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="px-5 py-3 rounded-md bg-primary text-white font-semibold text-center hover:bg-primary/90"
          >
            На главную
          </Link>
          <Link
            href="/leaderboard"
            className="px-5 py-3 rounded-md border border-border bg-surface text-text font-semibold text-center hover:bg-bg"
          >
            Открыть лидерборд
          </Link>
        </div>
      </main>
    );
  }

  const currentPair = initialPairs[roundIndex];
  if (!currentPair) {
    // Защита от рантайма: finalize должен сработать раньше.
    return <div aria-hidden="true" />;
  }

  return (
    <TestRound
      key={roundIndex}
      pair={currentPair}
      roundIndex={roundIndex}
      totalRounds={initialPairs.length}
      durationSeconds={DURATIONS[currentPair.modality]}
      onComplete={handleRoundComplete}
    />
  );
}

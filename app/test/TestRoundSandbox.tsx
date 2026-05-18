'use client';

import { TestRound } from '../../components/TestRound';
import type { Pair, RoundResult } from '../../lib/types';

interface TestRoundSandboxProps {
  pair: Pair;
}

export function TestRoundSandbox({ pair }: TestRoundSandboxProps) {
  function handleComplete(result: RoundResult) {
    // sandbox: only log; TestSession will replace this
    // eslint-disable-next-line no-console
    console.log('Round complete:', result);
  }
  return (
    <TestRound
      pair={pair}
      roundIndex={0}
      totalRounds={8}
      durationSeconds={45}
      onComplete={handleComplete}
    />
  );
}

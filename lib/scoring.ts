import type { BiasProfile, Modality, RoundResult } from './types';

const MODALITIES: readonly Modality[] = ['text', 'image', 'video', 'audio'];

function countCorrect(rounds: readonly RoundResult[]): number {
  let correct = 0;
  for (const round of rounds) {
    const [itemA, itemB] = round.pair.items;
    const [labelA, labelB] = round.userLabels;
    if (labelA === itemA.source) correct++;
    if (labelB === itemB.source) correct++;
  }
  return correct;
}

export function computeAIQ(rounds: readonly RoundResult[]): number {
  const total = rounds.length * 2;
  if (total === 0) return 0;
  return Math.round((countCorrect(rounds) / total) * 100);
}

export function computeModalityScores(
  rounds: readonly RoundResult[],
): Record<Modality, number> {
  const correctByModality: Record<Modality, number> = {
    text: 0,
    image: 0,
    video: 0,
    audio: 0,
  };
  const totalByModality: Record<Modality, number> = {
    text: 0,
    image: 0,
    video: 0,
    audio: 0,
  };

  for (const round of rounds) {
    const modality = round.pair.modality;
    const [itemA, itemB] = round.pair.items;
    const [labelA, labelB] = round.userLabels;
    totalByModality[modality] += 2;
    if (labelA === itemA.source) correctByModality[modality]++;
    if (labelB === itemB.source) correctByModality[modality]++;
  }

  const out: Record<Modality, number> = {
    text: 0,
    image: 0,
    video: 0,
    audio: 0,
  };
  for (const m of MODALITIES) {
    const total = totalByModality[m];
    out[m] = total === 0 ? 0 : Math.round((correctByModality[m] / total) * 100);
  }
  return out;
}

export function computeBiasProfile(rounds: readonly RoundResult[]): BiasProfile {
  // Тайм-аут (label === null) намеренно не классифицируется ни как FP, ни как FN:
  // пользователь не сделал выбор, поэтому никакого смещения не наблюдается.
  // Для AIQ это идёт в "неправильные", но для bias-профиля — нейтрально.
  let falsePositive = 0;
  let falseNegative = 0;
  for (const round of rounds) {
    const [itemA, itemB] = round.pair.items;
    const [labelA, labelB] = round.userLabels;
    for (const [label, item] of [
      [labelA, itemA] as const,
      [labelB, itemB] as const,
    ]) {
      if (label === 'ai' && item.source === 'human') falsePositive++;
      else if (label === 'human' && item.source === 'ai') falseNegative++;
    }
  }
  const delta = falsePositive - falseNegative;
  if (delta >= 2) return 'paranoid';
  if (delta <= -2) return 'trusting';
  return 'balanced';
}

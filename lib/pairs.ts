import type { ContentItem, ContentType, Modality, Pair } from './types';
import { MODALITY_BY_TYPE } from './types';

export type Rng = () => number;

function shuffle<T>(arr: readonly T[], rng: Rng): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = copy[i] as T;
    copy[i] = copy[j] as T;
    copy[j] = tmp;
  }
  return copy;
}

function pickOne<T>(arr: readonly T[], rng: Rng): T {
  if (arr.length === 0) {
    throw new Error('pickOne: empty array');
  }
  return arr[Math.floor(rng() * arr.length)] as T;
}

function groupBy<T, K extends string>(arr: readonly T[], keyOf: (item: T) => K): Record<K, T[]> {
  const out = {} as Record<K, T[]>;
  for (const item of arr) {
    const k = keyOf(item);
    const bucket = out[k];
    if (bucket) {
      bucket.push(item);
    } else {
      out[k] = [item];
    }
  }
  return out;
}

export function buildAllPairs(items: readonly ContentItem[]): Pair[] {
  const byType = groupBy(items, (it) => it.type);
  const pairs: Pair[] = [];

  for (const type of Object.keys(byType) as ContentType[]) {
    const group = byType[type];
    if (!group) continue;
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const a = group[i] as ContentItem;
        const b = group[j] as ContentItem;
        const [first, second] = a.id < b.id ? [a, b] : [b, a];
        pairs.push({
          id: `${type}-${first.id}-${second.id}`,
          type,
          modality: MODALITY_BY_TYPE[type],
          items: [first, second],
        });
      }
    }
  }

  return pairs;
}

function pickPairsAcrossTypes(
  pairsByType: Record<string, Pair[]>,
  count: number,
  rng: Rng,
): Pair[] {
  const types = Object.keys(pairsByType).filter((t) => (pairsByType[t]?.length ?? 0) > 0);
  const shuffledTypes = shuffle(types, rng);
  const result: Pair[] = [];

  for (const t of shuffledTypes) {
    if (result.length === count) break;
    const bucket = pairsByType[t];
    if (!bucket || bucket.length === 0) continue;
    result.push(pickOne(bucket, rng));
  }

  if (result.length < count) {
    const used = new Set(result.map((p) => p.id));
    const remaining: Pair[] = [];
    for (const t of types) {
      const bucket = pairsByType[t];
      if (!bucket) continue;
      for (const p of bucket) {
        if (!used.has(p.id)) remaining.push(p);
      }
    }
    const shuffledRemaining = shuffle(remaining, rng);
    for (const p of shuffledRemaining) {
      if (result.length === count) break;
      result.push(p);
    }
  }

  return result;
}

export function selectSessionPairs(
  allPairs: readonly Pair[],
  rng: Rng = Math.random,
): Pair[] {
  const byModality = groupBy(allPairs, (p) => p.modality) as Record<Modality, Pair[]>;
  const byType = groupBy(allPairs, (p) => p.type) as Record<ContentType, Pair[]>;

  const textPairsByType: Record<string, Pair[]> = {
    marketplace: byType.marketplace ?? [],
    bank: byType.bank ?? [],
    'ai-note': byType['ai-note'] ?? [],
  };
  const audioPairsByType: Record<string, Pair[]> = {
    'phone-call-a': byType['phone-call-a'] ?? [],
    'phone-call-b': byType['phone-call-b'] ?? [],
    song: byType.song ?? [],
  };

  const textPicks = pickPairsAcrossTypes(textPairsByType, 2, rng);
  const audioPicks = pickPairsAcrossTypes(audioPairsByType, 2, rng);

  const paintingPick = pickOne(byType.painting ?? [], rng);
  const landscapePick = pickOne(byType.landscape ?? [], rng);
  const catVideoPick = pickOne(byType['cat-video'] ?? [], rng);
  const adVideoPick = pickOne(byType['ad-video'] ?? [], rng);

  void byModality;

  return [
    ...textPicks,
    paintingPick,
    landscapePick,
    catVideoPick,
    adVideoPick,
    ...audioPicks,
  ];
}

import {
  AUDIO_KIND_BY_TYPE,
  MODALITY_BY_TYPE,
  ROUND_TITLES,
  getDurationSeconds,
} from './types';
import type {
  ContentItem,
  ContentType,
  Modality,
  Pair,
  PublicItem,
  PublicPair,
} from './types';

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
        // pair.id строится только из item id, БЕЗ префикса type —
        // на клиенте (PublicPair) id не должен раскрывать подкатегорию.
        pairs.push({
          id: `${first.id}-${second.id}`,
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
  const byType = groupBy(allPairs, (p) => p.type) as Record<ContentType, Pair[]>;

  // text — 2 пары из 3 типов (по возможности из разных)
  const textPairsByType: Record<string, Pair[]> = {
    marketplace: byType.marketplace ?? [],
    bank: byType.bank ?? [],
    note: byType.note ?? [],
  };
  const textPicks = pickPairsAcrossTypes(textPairsByType, 2, rng);

  // image / video / audio — жёстко по одной паре каждого типа
  const paintingPick = pickOne(byType.painting ?? [], rng);
  const landscapePick = pickOne(byType.landscape ?? [], rng);
  const catVideoPick = pickOne(byType.catvideo ?? [], rng);
  const adVideoPick = pickOne(byType.advideo ?? [], rng);
  const phonecallPick = pickOne(byType.phonecall ?? [], rng);
  const songPick = pickOne(byType.song ?? [], rng);

  return [
    ...textPicks,
    paintingPick,
    landscapePick,
    catVideoPick,
    adVideoPick,
    phonecallPick,
    songPick,
  ];
}

// === Public conversion ===

function toPublicItem(item: ContentItem, type: ContentType): PublicItem {
  const audioKind = AUDIO_KIND_BY_TYPE[type];
  const publicItem: PublicItem = {
    id: item.id,
    modality: item.modality,
  };
  if (item.content !== undefined) publicItem.content = item.content;
  if (item.url !== undefined) publicItem.url = item.url;
  if (audioKind !== undefined) publicItem.audioKind = audioKind;
  return publicItem;
}

export function toPublic(pair: Pair): PublicPair {
  return {
    id: pair.id,
    modality: pair.modality,
    roundTitle: ROUND_TITLES[pair.type],
    durationSeconds: getDurationSeconds(pair.type),
    items: [
      toPublicItem(pair.items[0], pair.type),
      toPublicItem(pair.items[1], pair.type),
    ],
  };
}

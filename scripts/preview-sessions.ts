import { buildAllPairs, selectSessionPairs } from '../lib/pairs';
import type { Rng } from '../lib/pairs';
import type { ContentItem, Pair } from '../lib/types';
import contentData from '../lib/content.json';

const items = contentData.items as ContentItem[];
const allPairs = buildAllPairs(items);

function mulberry32(seed: number): Rng {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fmtItem(item: ContentItem): string {
  return `${item.id} [${item.source}]`;
}

function fmtPair(p: Pair, idx: number): string {
  const [a, b] = p.items;
  return `  ${idx + 1}. ${p.modality.padEnd(5)} ${p.type.padEnd(14)} → ${fmtItem(a).padEnd(28)} vs  ${fmtItem(b)}`;
}

console.log(`Total pairs available: ${allPairs.length}\n`);

for (const seed of [1, 2, 3, 4, 5]) {
  const rng = mulberry32(seed);
  const session = selectSessionPairs(allPairs, rng);
  console.log(`=== Session (seed=${seed}) — ${session.length} pairs ===`);
  session.forEach((p, i) => console.log(fmtPair(p, i)));
  console.log('');
}

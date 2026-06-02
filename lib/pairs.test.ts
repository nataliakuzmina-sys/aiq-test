import { describe, it, expect } from 'vitest';
import { buildAllPairs, selectSessionPairs, toPublic } from './pairs';
import type { ContentItem, ContentType, Modality } from './types';
import contentData from './content.json';

const items = contentData.items as ContentItem[];
const allPairs = buildAllPairs(items);

describe('buildAllPairs', () => {
  it('возвращает 61 пар для текущего банка из 35 единиц', () => {
    expect(items.length).toBe(35);
    expect(allPairs.length).toBe(61);
  });

  it('распределение по типам соответствует C(n,2)', () => {
    const counts: Record<string, number> = {};
    for (const p of allPairs) counts[p.type] = (counts[p.type] ?? 0) + 1;
    expect(counts).toEqual({
      marketplace: 3,
      bank: 3,
      note: 3,
      painting: 15,
      landscape: 15,
      catvideo: 3,
      advideo: 1,
      phonecall: 15,
      song: 3,
    });
  });

  it('каждая пара содержит 2 разных item одного type и modality', () => {
    for (const p of allPairs) {
      const [a, b] = p.items;
      expect(a.id).not.toBe(b.id);
      expect(a.type).toBe(p.type);
      expect(b.type).toBe(p.type);
      expect(a.modality).toBe(p.modality);
      expect(b.modality).toBe(p.modality);
    }
  });

  it('id пары стабилен независимо от порядка items на входе', () => {
    const reversed = items.slice().reverse();
    const idsA = buildAllPairs(items).map((p) => p.id).sort();
    const idsB = buildAllPairs(reversed).map((p) => p.id).sort();
    expect(idsA).toEqual(idsB);
  });

  it('id пары имеет формат {idA}-{idB} (лексически отсортированные), без префикса type', () => {
    for (const p of allPairs) {
      const [a, b] = p.items;
      const first = a.id < b.id ? a.id : b.id;
      const second = a.id < b.id ? b.id : a.id;
      expect(p.id).toBe(`${first}-${second}`);
      // id не должен содержать имя type (раскрытие подкатегории)
      expect(p.id).not.toContain(p.type);
    }
  });

  it('id всех пар уникальны', () => {
    const ids = allPairs.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('modality берётся из таблицы, а не из item (защита от грязных данных)', () => {
    const dirtyItems: ContentItem[] = [
      { id: 'x1', type: 'marketplace', modality: 'audio', source: 'ai', content: 'x' },
      { id: 'x2', type: 'marketplace', modality: 'video', source: 'human', content: 'y' },
    ];
    const pairs = buildAllPairs(dirtyItems);
    expect(pairs.length).toBe(1);
    expect(pairs[0]?.modality).toBe('text');
  });
});

describe('selectSessionPairs', () => {
  const RUNS = 1000;

  it('всегда возвращает 8 уникальных пар', () => {
    for (let i = 0; i < RUNS; i++) {
      const s = selectSessionPairs(allPairs);
      expect(s).toHaveLength(8);
      expect(new Set(s.map((p) => p.id)).size).toBe(8);
    }
  });

  it('распределение по модальностям всегда 2/2/2/2', () => {
    for (let i = 0; i < RUNS; i++) {
      const s = selectSessionPairs(allPairs);
      const byMod: Record<Modality, number> = { text: 0, image: 0, video: 0, audio: 0 };
      for (const p of s) byMod[p.modality]++;
      expect(byMod).toEqual({ text: 2, image: 2, video: 2, audio: 2 });
    }
  });

  it('в image всегда ровно 1 painting + 1 landscape', () => {
    for (let i = 0; i < RUNS; i++) {
      const s = selectSessionPairs(allPairs);
      const types = s.filter((p) => p.modality === 'image').map((p) => p.type).sort();
      expect(types).toEqual(['landscape', 'painting']);
    }
  });

  it('в video всегда ровно 1 catvideo + 1 advideo', () => {
    for (let i = 0; i < RUNS; i++) {
      const s = selectSessionPairs(allPairs);
      const types = s.filter((p) => p.modality === 'video').map((p) => p.type).sort();
      expect(types).toEqual(['advideo', 'catvideo']);
    }
  });

  it('в audio всегда ровно 1 phonecall + 1 song', () => {
    for (let i = 0; i < RUNS; i++) {
      const s = selectSessionPairs(allPairs);
      const types = s.filter((p) => p.modality === 'audio').map((p) => p.type).sort();
      expect(types).toEqual(['phonecall', 'song']);
    }
  });

  it('text-пары всегда из 2 разных типов (при доступных 3 типах по ≥3 пары)', () => {
    for (let i = 0; i < RUNS; i++) {
      const s = selectSessionPairs(allPairs);
      const types = s.filter((p) => p.modality === 'text').map((p) => p.type);
      expect(new Set(types).size).toBe(2);
    }
  });

  it('seeded RNG даёт детерминированный результат', () => {
    const seed = (initial: number) => {
      let s = initial;
      return () => {
        s = (s * 1664525 + 1013904223) >>> 0;
        return s / 0x100000000;
      };
    };
    const s1 = selectSessionPairs(allPairs, seed(42)).map((p) => p.id);
    const s2 = selectSessionPairs(allPairs, seed(42)).map((p) => p.id);
    const s3 = selectSessionPairs(allPairs, seed(43)).map((p) => p.id);
    expect(s1).toEqual(s2);
    expect(s1).not.toEqual(s3);
  });

  it('fallback: если в text доступен только 1 тип, добирает 2 пары из него', () => {
    const onlyMarketplaceItems = items.filter((it) => it.type === 'marketplace');
    const otherItems = items.filter((it) => it.modality !== 'text');
    const reducedPairs = buildAllPairs([...onlyMarketplaceItems, ...otherItems]);
    for (let i = 0; i < 50; i++) {
      const s = selectSessionPairs(reducedPairs);
      const textPairs = s.filter((p) => p.modality === 'text');
      expect(textPairs).toHaveLength(2);
      const types = new Set(textPairs.map((p) => p.type as ContentType));
      expect(types.size).toBe(1);
      expect(textPairs[0]?.id).not.toBe(textPairs[1]?.id);
    }
  });
});

describe('toPublic', () => {
  it('убирает source и type из items, добавляет roundTitle', () => {
    for (const pair of allPairs) {
      const pub = toPublic(pair);
      expect(pub.id).toBe(pair.id);
      expect(pub.modality).toBe(pair.modality);
      expect(typeof pub.roundTitle).toBe('string');
      expect(pub.roundTitle.length).toBeGreaterThan(0);
      for (const it of pub.items) {
        expect(it).not.toHaveProperty('source');
        expect(it).not.toHaveProperty('type');
        expect(it.id).toMatch(/^[a-f0-9]{12}$/);
      }
    }
  });

  it('добавляет audioKind только для аудио (call/song)', () => {
    for (const pair of allPairs) {
      const pub = toPublic(pair);
      if (pair.modality === 'audio') {
        const expected = pair.type === 'phonecall' ? 'call' : 'song';
        for (const it of pub.items) {
          expect(it.audioKind).toBe(expected);
        }
      } else {
        for (const it of pub.items) {
          expect(it.audioKind).toBeUndefined();
        }
      }
    }
  });
});

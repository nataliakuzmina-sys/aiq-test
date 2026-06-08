import { describe, it, expect } from 'vitest';
import { getTitle } from './titles';
import type { BiasProfile } from './types';

const BIASES: readonly BiasProfile[] = ['balanced', 'paranoid', 'trusting'];

describe('getTitle — границы AIQ (самое хрупкое место)', () => {
  it.each<[number, string]>([
    [100, 'AI-снайпер: бьёт без промаха'],
    [85, 'AI-снайпер: бьёт без промаха'],
    [84, 'Зоркость в норме'],
    [65, 'Зоркость в норме'],
    [64, '50 / 50'],
    [45, '50 / 50'],
    [44, 'Границы стёрлись'],
    [0, 'Границы стёрлись'],
  ])('aiq=%i, bias=balanced → "%s"', (aiq, expected) => {
    expect(getTitle(aiq, 'balanced')).toBe(expected);
  });

  it('границы AIQ ведут себя одинаково для всех bias-профилей', () => {
    for (const bias of BIASES) {
      expect(getTitle(85, bias)).toBe(getTitle(100, bias));
      expect(getTitle(84, bias)).toBe(getTitle(65, bias));
      expect(getTitle(64, bias)).toBe(getTitle(45, bias));
      expect(getTitle(44, bias)).toBe(getTitle(0, bias));

      expect(getTitle(85, bias)).not.toBe(getTitle(84, bias));
      expect(getTitle(65, bias)).not.toBe(getTitle(64, bias));
      expect(getTitle(45, bias)).not.toBe(getTitle(44, bias));
    }
  });
});

describe('getTitle — полная матрица 4×3', () => {
  it.each<[number, BiasProfile, string]>([
    [90, 'balanced', 'AI-снайпер: бьёт без промаха'],
    [90, 'paranoid', 'Видит ИИ даже там, где его нет'],
    [90, 'trusting', 'Верит людям — и не зря'],
    [70, 'balanced', 'Зоркость в норме'],
    [70, 'paranoid', 'Подозревает даже котят'],
    [70, 'trusting', 'Чаще верит, чем сомневается'],
    [50, 'balanced', '50 / 50'],
    [50, 'paranoid', 'Постоянно ищет ИИ — и часто находит в людях'],
    [50, 'trusting', 'Готов принять любого'],
    [20, 'balanced', 'Границы стёрлись'],
    [20, 'paranoid', 'Везде видит ИИ — и ошибается'],
    [20, 'trusting', 'Ищет человечность — и ошибается'],
  ])('aiq=%i, bias=%s → "%s"', (aiq, bias, expected) => {
    expect(getTitle(aiq, bias)).toBe(expected);
  });
});

describe('getTitle — инварианты матрицы', () => {
  const REP_AIQS: readonly number[] = [90, 70, 50, 20];

  it('все 12 ячеек уникальны (нет дублей)', () => {
    const titles: string[] = [];
    for (const aiq of REP_AIQS) for (const bias of BIASES) titles.push(getTitle(aiq, bias));
    expect(titles).toHaveLength(12);
    expect(new Set(titles).size).toBe(12);
  });

  it('все 12 ячеек возвращают непустую строку', () => {
    for (const aiq of REP_AIQS) {
      for (const bias of BIASES) {
        const title = getTitle(aiq, bias);
        expect(title).toBeTypeOf('string');
        expect(title.length).toBeGreaterThan(0);
      }
    }
  });
});

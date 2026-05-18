import { describe, it, expect } from 'vitest';
import { getTitle } from './titles';
import type { BiasProfile } from './types';

const BIASES: readonly BiasProfile[] = ['balanced', 'paranoid', 'trusting'];

describe('getTitle — границы AIQ (самое хрупкое место)', () => {
  it.each<[number, string]>([
    [100, 'AI-снайпер'],
    [85, 'AI-снайпер'],
    [84, 'ИИ-зоркость в норме'],
    [65, 'ИИ-зоркость в норме'],
    [64, 'Половину распознаёт'],
    [45, 'Половину распознаёт'],
    [44, 'Уже не различает'],
    [0, 'Уже не различает'],
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
    [90, 'balanced', 'AI-снайпер'],
    [90, 'paranoid', 'Видит ИИ даже там, где его нет'],
    [90, 'trusting', 'Точен, когда уверен'],
    [70, 'balanced', 'ИИ-зоркость в норме'],
    [70, 'paranoid', 'Видит ИИ даже в котах'],
    [70, 'trusting', 'Замечает машинку через раз'],
    [50, 'balanced', 'Половину распознаёт'],
    [50, 'paranoid', 'Постоянно ищет ИИ — и часто находит в людях'],
    [50, 'trusting', 'Готов принять любого'],
    [20, 'balanced', 'Уже не различает'],
    [20, 'paranoid', 'Никому не верит'],
    [20, 'trusting', 'Готов поверить любому'],
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

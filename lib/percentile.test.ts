import { describe, it, expect } from 'vitest';
import { computePercentile } from './percentile';

describe('computePercentile', () => {
  it('базовый кейс: userAiq=35, others=[10,20,30,40,50] → 60', () => {
    expect(computePercentile(35, [10, 20, 30, 40, 50])).toBe(60);
  });

  it('пустой массив → null', () => {
    expect(computePercentile(75, [])).toBeNull();
  });

  describe('ничьи (сравнение строгое: равные не учитываются)', () => {
    it('userAiq совпадает с одним элементом — этот не считается', () => {
      expect(computePercentile(50, [10, 20, 30, 40, 50])).toBe(80);
    });

    it('userAiq совпадает с несколькими элементами — никто из них не считается', () => {
      expect(computePercentile(50, [50, 50, 50, 50, 30])).toBe(20);
    });

    it('userAiq совпадает со ВСЕМИ элементами → 0', () => {
      expect(computePercentile(50, [50, 50, 50])).toBe(0);
    });
  });

  describe('крайние распределения', () => {
    it('все элементы ниже userAiq → 100', () => {
      expect(computePercentile(100, [10, 20, 30])).toBe(100);
    });

    it('все элементы выше userAiq → 0', () => {
      expect(computePercentile(0, [10, 20, 30])).toBe(0);
    });
  });

  describe('массив из одного элемента', () => {
    it('единственный элемент ниже → 100', () => {
      expect(computePercentile(50, [40])).toBe(100);
    });

    it('единственный элемент равен → 0 (строгое неравенство)', () => {
      expect(computePercentile(50, [50])).toBe(0);
    });

    it('единственный элемент выше → 0', () => {
      expect(computePercentile(50, [60])).toBe(0);
    });
  });

  describe('округление до целого', () => {
    it('1/3 → 33', () => {
      expect(computePercentile(50, [40, 50, 60])).toBe(33);
    });

    it('2/3 → 67', () => {
      expect(computePercentile(60, [40, 50, 70])).toBe(67);
    });

    it('1/6 ≈ 16.67 → 17', () => {
      expect(computePercentile(50, [40, 50, 50, 60, 70, 80])).toBe(17);
    });

    it('5/6 ≈ 83.33 → 83', () => {
      expect(computePercentile(80, [10, 20, 30, 40, 50, 80])).toBe(83);
    });
  });

  describe('крайние значения диапазона AIQ', () => {
    it('userAiq=0 на массиве [0,50,100] → 0', () => {
      expect(computePercentile(0, [0, 50, 100])).toBe(0);
    });

    it('userAiq=100 на массиве [0,50,100] → 67 (равная не считается)', () => {
      expect(computePercentile(100, [0, 50, 100])).toBe(67);
    });
  });
});

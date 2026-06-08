import type { BiasProfile } from './types';

type AiqBracket = 'high' | 'mid-high' | 'mid-low' | 'low';

function bracketOf(aiq: number): AiqBracket {
  if (aiq >= 85) return 'high';
  if (aiq >= 65) return 'mid-high';
  if (aiq >= 45) return 'mid-low';
  return 'low';
}

const TITLES: Record<AiqBracket, Record<BiasProfile, string>> = {
  high: {
    balanced: 'AI-снайпер: бьёт без промаха',
    paranoid: 'Видит ИИ даже там, где его нет',
    trusting: 'Верит людям — и не зря',
  },
  'mid-high': {
    balanced: 'Зоркость в норме',
    paranoid: 'Подозревает даже котят',
    trusting: 'Чаще верит, чем сомневается',
  },
  'mid-low': {
    balanced: '50 / 50',
    paranoid: 'Постоянно ищет ИИ — и часто находит в людях',
    trusting: 'Готов принять любого',
  },
  low: {
    balanced: 'Границы стёрлись',
    paranoid: 'Везде видит ИИ — и ошибается',
    trusting: 'Ищет человечность — и ошибается',
  },
};

export function getTitle(aiq: number, bias: BiasProfile): string {
  return TITLES[bracketOf(aiq)][bias];
}

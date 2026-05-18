import type { BiasProfile } from './types';

type AiqBracket = 'high' | 'mid-high' | 'mid-low' | 'low';

function bracketOf(aiq: number): AiqBracket {
  if (aiq >= 85) return 'high';
  if (aiq >= 65) return 'mid-high';
  if (aiq >= 45) return 'mid-low';
  return 'low';
}

// Заглушки из PRD.md. Копирайтер заменит финальными формулировками.
const TITLES: Record<AiqBracket, Record<BiasProfile, string>> = {
  high: {
    balanced: 'AI-снайпер',
    paranoid: 'Видит ИИ даже там, где его нет',
    trusting: 'Точен, когда уверен',
  },
  'mid-high': {
    balanced: 'ИИ-зоркость в норме',
    paranoid: 'Видит ИИ даже в котах',
    trusting: 'Замечает машинку через раз',
  },
  'mid-low': {
    balanced: 'Половину распознаёт',
    paranoid: 'Постоянно ищет ИИ — и часто находит в людях',
    trusting: 'Готов принять любого',
  },
  low: {
    balanced: 'Уже не различает',
    paranoid: 'Никому не верит',
    trusting: 'Готов поверить любому',
  },
};

export function getTitle(aiq: number, bias: BiasProfile): string {
  return TITLES[bracketOf(aiq)][bias];
}

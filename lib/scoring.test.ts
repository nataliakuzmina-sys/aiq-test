import { describe, it, expect } from 'vitest';
import { computeAIQ, computeBiasProfile, computeModalityScores } from './scoring';
import type {
  ContentItem,
  ContentType,
  Modality,
  RoundResult,
  Source,
} from './types';

const TYPE_BY_MODALITY: Record<Modality, ContentType> = {
  text: 'marketplace',
  image: 'painting',
  video: 'catvideo',
  audio: 'song',
};

function mkItem(modality: Modality, suffix: string, source: Source): ContentItem {
  const type = TYPE_BY_MODALITY[modality];
  return { id: `${type}-${suffix}`, type, modality, source };
}

function mkRound(
  modality: Modality,
  truth: [Source, Source],
  labels: [Source | null, Source | null],
  idSuffix = '',
): RoundResult {
  const type = TYPE_BY_MODALITY[modality];
  const itemA = mkItem(modality, `a${idSuffix}`, truth[0]);
  const itemB = mkItem(modality, `b${idSuffix}`, truth[1]);
  return {
    pair: {
      id: `${type}-${itemA.id}-${itemB.id}`,
      type,
      modality,
      items: [itemA, itemB],
    },
    userLabels: labels,
  };
}

const SESSION_MODALITIES: readonly Modality[] = [
  'text',
  'text',
  'image',
  'image',
  'video',
  'video',
  'audio',
  'audio',
];

/**
 * 8 раундов с распределением 2/2/2/2 по модальностям.
 * Все ответы по умолчанию правильные; через `modify` можно изменить любой раунд.
 */
function defaultSession(
  modify: (rounds: RoundResult[]) => void = () => undefined,
): RoundResult[] {
  const rounds: RoundResult[] = [];
  for (let i = 0; i < 8; i++) {
    const m = SESSION_MODALITIES[i] as Modality;
    const truth: [Source, Source] = i % 2 === 0 ? ['ai', 'human'] : ['human', 'ai'];
    rounds.push(mkRound(m, truth, [truth[0], truth[1]], String(i)));
  }
  modify(rounds);
  return rounds;
}

function flipLabel(s: Source): Source {
  return s === 'ai' ? 'human' : 'ai';
}

function makeBothWrong(round: RoundResult): void {
  const [a, b] = round.pair.items;
  round.userLabels = [flipLabel(a.source), flipLabel(b.source)];
}

describe('computeAIQ', () => {
  it('все 16 правильно → 100', () => {
    expect(computeAIQ(defaultSession())).toBe(100);
  });

  it('все 16 неправильно → 0', () => {
    const rounds = defaultSession((rs) => rs.forEach(makeBothWrong));
    expect(computeAIQ(rounds)).toBe(0);
  });

  it('12 правильно, 4 неправильно → 75', () => {
    const rounds = defaultSession((rs) => {
      makeBothWrong(rs[0] as RoundResult);
      makeBothWrong(rs[1] as RoundResult);
    });
    expect(computeAIQ(rounds)).toBe(75);
  });

  it('8 правильно, 8 неправильно → 50', () => {
    const rounds = defaultSession((rs) => {
      for (let i = 0; i < 4; i++) makeBothWrong(rs[i] as RoundResult);
    });
    expect(computeAIQ(rounds)).toBe(50);
  });

  it('все ответы null (тайм-аут) → 0', () => {
    const rounds = defaultSession((rs) => {
      for (const r of rs) r.userLabels = [null, null];
    });
    expect(computeAIQ(rounds)).toBe(0);
  });

  it('null + правильный в каждом раунде → 50', () => {
    const rounds = defaultSession((rs) => {
      for (const r of rs) {
        const [, b] = r.pair.items;
        r.userLabels = [null, b.source];
      }
    });
    expect(computeAIQ(rounds)).toBe(50);
  });

  it('пустой массив → 0 без падения', () => {
    expect(computeAIQ([])).toBe(0);
  });
});

describe('computeModalityScores', () => {
  it('все 16 правильно → 100 по каждой модальности', () => {
    expect(computeModalityScores(defaultSession())).toEqual({
      text: 100,
      image: 100,
      video: 100,
      audio: 100,
    });
  });

  it('text 4/4, image 3/4, video 2/4, audio 1/4', () => {
    const rounds = defaultSession((rs) => {
      // image: ошибка в 1 из 4 (один item раунда 2 неправильный)
      const r2 = rs[2] as RoundResult;
      r2.userLabels = [flipLabel(r2.pair.items[0].source), r2.pair.items[1].source];

      // video: 2 из 4 неправильных (весь раунд 4 неправильный)
      makeBothWrong(rs[4] as RoundResult);

      // audio: 3 из 4 неправильных
      makeBothWrong(rs[6] as RoundResult);
      const r7 = rs[7] as RoundResult;
      r7.userLabels = [flipLabel(r7.pair.items[0].source), r7.pair.items[1].source];
    });
    expect(computeModalityScores(rounds)).toEqual({
      text: 100,
      image: 75,
      video: 50,
      audio: 25,
    });
  });

  it('тайм-аут засчитывается как неправильный в модальном субскоре', () => {
    const rounds = defaultSession((rs) => {
      const r0 = rs[0] as RoundResult;
      r0.userLabels = [null, null];
    });
    // text: 2 правильных из 4 → 50
    expect(computeModalityScores(rounds)).toEqual({
      text: 50,
      image: 100,
      video: 100,
      audio: 100,
    });
  });

  it('пустой массив → все 0', () => {
    expect(computeModalityScores([])).toEqual({
      text: 0,
      image: 0,
      video: 0,
      audio: 0,
    });
  });
});

interface BiasFixtureSpec {
  fp: number;
  fn: number;
  timeouts?: number;
  timeoutTruth?: Source;
}

/**
 * Строит сессию из 8 раундов (16 item) с заданным числом FP/FN и тайм-аутов.
 * Оставшиеся пункты — корректные ai+ai пары с правильными метками.
 */
function biasFixture({
  fp,
  fn,
  timeouts = 0,
  timeoutTruth = 'human',
}: BiasFixtureSpec): RoundResult[] {
  type Spec = { truth: Source; label: Source | null };
  const items: Spec[] = [];
  for (let i = 0; i < fp; i++) items.push({ truth: 'human', label: 'ai' });
  for (let i = 0; i < fn; i++) items.push({ truth: 'ai', label: 'human' });
  for (let i = 0; i < timeouts; i++) items.push({ truth: timeoutTruth, label: null });
  while (items.length < 16) items.push({ truth: 'ai', label: 'ai' });
  if (items.length > 16) {
    throw new Error(`biasFixture: too many items (${items.length}); session is 16`);
  }
  const rounds: RoundResult[] = [];
  for (let i = 0; i < 8; i++) {
    const a = items[i * 2] as Spec;
    const b = items[i * 2 + 1] as Spec;
    rounds.push(mkRound('text', [a.truth, b.truth], [a.label, b.label], String(i)));
  }
  return rounds;
}

describe('computeBiasProfile', () => {
  it('FP=4, FN=0 → paranoid (delta=4)', () => {
    expect(computeBiasProfile(biasFixture({ fp: 4, fn: 0 }))).toBe('paranoid');
  });

  it('FP=0, FN=4 → trusting (delta=-4)', () => {
    expect(computeBiasProfile(biasFixture({ fp: 0, fn: 4 }))).toBe('trusting');
  });

  it('FP=2, FN=2 → balanced (delta=0)', () => {
    expect(computeBiasProfile(biasFixture({ fp: 2, fn: 2 }))).toBe('balanced');
  });

  it('FP=3, FN=1 → paranoid (delta=2, нижняя граница включительно)', () => {
    expect(computeBiasProfile(biasFixture({ fp: 3, fn: 1 }))).toBe('paranoid');
  });

  it('FP=1, FN=3 → trusting (delta=-2, верхняя граница включительно)', () => {
    expect(computeBiasProfile(biasFixture({ fp: 1, fn: 3 }))).toBe('trusting');
  });

  it('FP=2, FN=1 → balanced (delta=1, в зоне нейтральности)', () => {
    expect(computeBiasProfile(biasFixture({ fp: 2, fn: 1 }))).toBe('balanced');
  });

  it('FP=1, FN=2 → balanced (delta=-1, в зоне нейтральности)', () => {
    expect(computeBiasProfile(biasFixture({ fp: 1, fn: 2 }))).toBe('balanced');
  });

  it('FP=0, FN=0 → balanced', () => {
    expect(computeBiasProfile(biasFixture({ fp: 0, fn: 0 }))).toBe('balanced');
  });

  it('тайм-ауты на human-источниках НЕ считаются как FP', () => {
    expect(
      computeBiasProfile(
        biasFixture({ fp: 0, fn: 0, timeouts: 4, timeoutTruth: 'human' }),
      ),
    ).toBe('balanced');
  });

  it('тайм-ауты на ai-источниках НЕ считаются как FN', () => {
    expect(
      computeBiasProfile(
        biasFixture({ fp: 0, fn: 0, timeouts: 4, timeoutTruth: 'ai' }),
      ),
    ).toBe('balanced');
  });

  it('тайм-ауты не маскируют существующий FP-перекос', () => {
    expect(
      computeBiasProfile(
        biasFixture({ fp: 3, fn: 0, timeouts: 2, timeoutTruth: 'ai' }),
      ),
    ).toBe('paranoid');
  });

  it('пустой массив → balanced (delta=0)', () => {
    expect(computeBiasProfile([])).toBe('balanced');
  });
});

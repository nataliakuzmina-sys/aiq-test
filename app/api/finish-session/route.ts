import { NextResponse } from 'next/server';
import contentData from '../../../lib/content.json';
import { buildAllPairs } from '../../../lib/pairs';
import {
  computeAIQ,
  computeBiasProfile,
  computeModalityScores,
} from '../../../lib/scoring';
import type {
  ContentItem,
  RoundResult,
  RoundSubmission,
  SessionResult,
  Source,
} from '../../../lib/types';

export const dynamic = 'force-dynamic';

const VALID_SOURCES: Source[] = ['ai', 'human'];

interface ValidatedRound {
  pairId: string;
  userLabels: [Source | null, Source | null];
}

function parseLabel(x: unknown): Source | null | undefined {
  if (x === null) return null;
  if (typeof x === 'string' && (VALID_SOURCES as string[]).includes(x)) {
    return x as Source;
  }
  return undefined;
}

function parseSubmission(raw: unknown): ValidatedRound[] | { error: string } {
  if (!raw || typeof raw !== 'object') {
    return { error: 'Невалидный запрос' };
  }
  const v = raw as Record<string, unknown>;
  if (!Array.isArray(v.rounds)) {
    return { error: 'rounds должен быть массивом' };
  }
  if (v.rounds.length === 0 || v.rounds.length > 16) {
    return { error: 'Неверное число раундов' };
  }
  const out: ValidatedRound[] = [];
  for (const r of v.rounds as unknown[]) {
    if (!r || typeof r !== 'object') {
      return { error: 'Невалидный раунд' };
    }
    const ro = r as Record<string, unknown>;
    if (typeof ro.pairId !== 'string' || ro.pairId.length === 0) {
      return { error: 'Невалидный pairId' };
    }
    if (!Array.isArray(ro.userLabels) || ro.userLabels.length !== 2) {
      return { error: 'userLabels должен содержать ровно 2 элемента' };
    }
    const a = parseLabel(ro.userLabels[0]);
    const b = parseLabel(ro.userLabels[1]);
    if (a === undefined || b === undefined) {
      return { error: 'Невалидное значение в userLabels' };
    }
    out.push({ pairId: ro.pairId, userLabels: [a, b] });
  }
  return out;
}

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: 'Невалидный JSON' }, { status: 400 });
  }

  const parsed = parseSubmission(raw);
  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const submissions = parsed;

  // Восстанавливаем реальные пары из приватного content.json. Источник истины —
  // серверный JSON; клиент знает только pairId.
  const items = contentData.items as ContentItem[];
  const allPairs = buildAllPairs(items);
  const pairById = new Map(allPairs.map((p) => [p.id, p]));

  const rounds: RoundResult[] = [];
  for (const s of submissions as RoundSubmission[]) {
    const pair = pairById.get(s.pairId);
    if (!pair) {
      return NextResponse.json(
        { error: `Неизвестный pairId: ${s.pairId}` },
        { status: 400 },
      );
    }
    rounds.push({ pair, userLabels: s.userLabels });
  }

  const session: SessionResult = {
    aiq: computeAIQ(rounds),
    modalityScores: computeModalityScores(rounds),
    biasProfile: computeBiasProfile(rounds),
    completedAt: Date.now(),
    // rounds НЕ отправляем — клиенту не нужно знать source/type из реальных pair'ов.
  };

  return NextResponse.json(session);
}

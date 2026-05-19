import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../lib/supabase-server';

export const dynamic = 'force-dynamic';

const VALID_BIAS = ['paranoid', 'trusting', 'balanced'] as const;
type Bias = (typeof VALID_BIAS)[number];

interface ValidatedBody {
  aiq: number;
  modalityText: number;
  modalityImage: number;
  modalityVideo: number;
  modalityAudio: number;
  biasProfile: Bias;
  displayName?: string;
  showInLeaderboard: boolean;
}

function isIntInRange(x: unknown, min: number, max: number): x is number {
  return (
    typeof x === 'number' && Number.isInteger(x) && x >= min && x <= max
  );
}

function parseBody(raw: unknown): ValidatedBody | { error: string } {
  if (!raw || typeof raw !== 'object') {
    return { error: 'Невалидный запрос' };
  }
  const v = raw as Record<string, unknown>;

  if (!isIntInRange(v.aiq, 0, 100)) return { error: 'aiq вне диапазона' };
  if (!isIntInRange(v.modalityText, 0, 100)) return { error: 'modalityText вне диапазона' };
  if (!isIntInRange(v.modalityImage, 0, 100)) return { error: 'modalityImage вне диапазона' };
  if (!isIntInRange(v.modalityVideo, 0, 100)) return { error: 'modalityVideo вне диапазона' };
  if (!isIntInRange(v.modalityAudio, 0, 100)) return { error: 'modalityAudio вне диапазона' };
  if (!VALID_BIAS.includes(v.biasProfile as Bias)) return { error: 'biasProfile неверный' };
  if (typeof v.showInLeaderboard !== 'boolean') return { error: 'showInLeaderboard должен быть bool' };

  let displayName: string | undefined;
  if (v.displayName !== undefined && v.displayName !== null) {
    if (typeof v.displayName !== 'string') return { error: 'displayName должен быть строкой' };
    const trimmed = v.displayName.trim();
    if (trimmed.length > 50) return { error: 'Имя длиннее 50 символов' };
    displayName = trimmed.length > 0 ? trimmed : undefined;
  }

  if (v.showInLeaderboard && !displayName) {
    return { error: 'Введите имя для публикации в лидерборде' };
  }

  return {
    aiq: v.aiq,
    modalityText: v.modalityText,
    modalityImage: v.modalityImage,
    modalityVideo: v.modalityVideo,
    modalityAudio: v.modalityAudio,
    biasProfile: v.biasProfile as Bias,
    displayName,
    showInLeaderboard: v.showInLeaderboard,
  };
}

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: 'Невалидный JSON' }, { status: 400 });
  }

  const parsed = parseBody(raw);
  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const body = parsed;

  // Процентиль считаем ДО INSERT — иначе пользователь учтёт сам себя.
  const totalQuery = await supabaseServer
    .from('results')
    .select('*', { count: 'exact', head: true });
  if (totalQuery.error || totalQuery.count === null) {
    return NextResponse.json({ error: 'Ошибка БД (count total)' }, { status: 500 });
  }
  const total = totalQuery.count;

  const belowQuery = await supabaseServer
    .from('results')
    .select('*', { count: 'exact', head: true })
    .lt('aiq', body.aiq);
  if (belowQuery.error || belowQuery.count === null) {
    return NextResponse.json({ error: 'Ошибка БД (count below)' }, { status: 500 });
  }
  const below = belowQuery.count;

  const percentile = total < 50 ? null : Math.round((below / total) * 100);

  const insertQuery = await supabaseServer
    .from('results')
    .insert({
      aiq: body.aiq,
      modality_text: body.modalityText,
      modality_image: body.modalityImage,
      modality_video: body.modalityVideo,
      modality_audio: body.modalityAudio,
      bias_profile: body.biasProfile,
      display_name: body.displayName ?? null,
      show_in_leaderboard: body.showInLeaderboard,
    })
    .select('id')
    .single();

  if (insertQuery.error || !insertQuery.data) {
    return NextResponse.json({ error: 'Ошибка сохранения' }, { status: 500 });
  }

  return NextResponse.json({
    resultId: insertQuery.data.id,
    percentile,
    totalResults: total + 1,
  });
}

import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import type { BiasProfile } from '../../../lib/types';

interface DbRow {
  id: string;
  display_name: string | null;
  expert_title: string | null;
  aiq: number;
  bias_profile: BiasProfile;
  is_expert: boolean;
  created_at: string;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawLimit = url.searchParams.get('limit');
  let limit = rawLimit ? parseInt(rawLimit, 10) : 100;
  if (!Number.isFinite(limit) || limit <= 0) limit = 100;
  if (limit > 100) limit = 100;

  const { data, error } = await supabase
    .from('results')
    .select(
      'id, display_name, expert_title, aiq, bias_profile, is_expert, created_at',
    )
    .order('aiq', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: 'Ошибка БД' }, { status: 500 });
  }

  const rows = (data as DbRow[] | null) ?? [];
  const results = rows.map((row, i) => ({
    id: row.id,
    rank: i + 1,
    displayName: row.display_name ?? 'Аноним',
    expertTitle: row.expert_title,
    aiq: row.aiq,
    biasProfile: row.bias_profile,
    isExpert: row.is_expert,
    createdAt: row.created_at,
  }));

  return NextResponse.json(
    { results },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    },
  );
}

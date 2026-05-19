import { Leaderboard, type LeaderboardEntry } from '../../components/Leaderboard';
import { supabase } from '../../lib/supabase';
import type { BiasProfile } from '../../lib/types';

export const revalidate = 60;

interface DbRow {
  id: string;
  display_name: string | null;
  expert_title: string | null;
  aiq: number;
  bias_profile: BiasProfile;
  is_expert: boolean;
  created_at: string;
}

export default async function LeaderboardPage() {
  const { data, error } = await supabase
    .from('results')
    .select(
      'id, display_name, expert_title, aiq, bias_profile, is_expert, created_at',
    )
    .order('aiq', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(100);

  if (error) {
    return (
      <main className="mx-auto w-full max-w-[900px] p-4 md:p-8 flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Топ ИИ-зорких людей маркетинга</h1>
        <p className="text-danger">Не удалось загрузить лидерборд.</p>
      </main>
    );
  }

  const rows = (data as DbRow[] | null) ?? [];
  const entries: LeaderboardEntry[] = rows.map((row, i) => ({
    id: row.id,
    rank: i + 1,
    displayName: row.display_name ?? 'Аноним',
    expertTitle: row.expert_title,
    aiq: row.aiq,
    biasProfile: row.bias_profile,
    isExpert: row.is_expert,
    createdAt: row.created_at,
  }));

  return (
    <main className="mx-auto w-full max-w-[900px] p-4 md:p-8 flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Топ ИИ-зорких людей маркетинга</h1>
      <Leaderboard entries={entries} />
    </main>
  );
}

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ResultScreen } from '../../../components/ResultScreen';
import { supabase } from '../../../lib/supabase';
import { getTitle } from '../../../lib/titles';
import type { BiasProfile, SessionResult } from '../../../lib/types';

interface DbRow {
  id: string;
  display_name: string | null;
  aiq: number;
  modality_text: number;
  modality_image: number;
  modality_video: number;
  modality_audio: number;
  bias_profile: BiasProfile;
  created_at: string;
}

interface PageProps {
  params: { id: string };
}

async function fetchPublicResult(id: string): Promise<DbRow | null> {
  const { data, error } = await supabase
    .from('results')
    .select(
      'id, display_name, aiq, modality_text, modality_image, modality_video, modality_audio, bias_profile, created_at',
    )
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;
  return data as DbRow;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const row = await fetchPublicResult(params.id);
  if (!row) return { title: 'AIQ' };
  const title = getTitle(row.aiq, row.bias_profile);
  return {
    title: `AIQ ${row.aiq} — ${title}`,
    description: `Распознал ИИ-контент на ${row.aiq} из 100. Проверишь себя?`,
    openGraph: {
      title: `AIQ ${row.aiq} — ${title}`,
      description: `Распознал ИИ-контент на ${row.aiq} из 100. Проверишь себя?`,
      type: 'website',
    },
  };
}

export default async function SharedResultPage({ params }: PageProps) {
  const row = await fetchPublicResult(params.id);
  if (!row) notFound();

  const session: SessionResult = {
    rounds: [],
    aiq: row.aiq,
    modalityScores: {
      text: row.modality_text,
      image: row.modality_image,
      video: row.modality_video,
      audio: row.modality_audio,
    },
    biasProfile: row.bias_profile,
    completedAt: new Date(row.created_at).getTime(),
  };

  return <ResultScreen session={session} mode="shared" />;
}

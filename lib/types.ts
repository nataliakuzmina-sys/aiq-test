export type Modality = 'text' | 'image' | 'video' | 'audio';

export type ContentType =
  | 'marketplace'
  | 'bank'
  | 'note'
  | 'painting'
  | 'landscape'
  | 'catvideo'
  | 'advideo'
  | 'phonecall'
  | 'song';

export type Source = 'ai' | 'human';

export type AudioKind = 'call' | 'song';

export type BiasProfile = 'paranoid' | 'trusting' | 'balanced';

// === SERVER-SIDE: полная информация, не уходит на клиент ===

export interface ContentItem {
  id: string;
  type: ContentType;
  modality: Modality;
  source: Source;
  content?: string;
  url?: string;
}

export interface Pair {
  id: string;
  type: ContentType;
  modality: Modality;
  items: [ContentItem, ContentItem];
}

export interface RoundResult {
  pair: Pair;
  userLabels: [Source | null, Source | null];
}

// === CLIENT-SIDE: обезличенный payload, передаётся на клиент ===
// БЕЗ source, БЕЗ type — только то, что нужно для рендера.

export interface PublicItem {
  id: string;
  modality: Modality;
  content?: string;
  url?: string;
  audioKind?: AudioKind;
}

export interface PublicPair {
  id: string;
  modality: Modality;
  roundTitle: string;
  durationSeconds: number;
  items: [PublicItem, PublicItem];
}

// === Client → API: что клиент отправляет на /api/finish-session ===

export interface RoundSubmission {
  pairId: string;
  userLabels: [Source | null, Source | null];
}

export interface SessionSubmission {
  rounds: RoundSubmission[];
}

// === Результат сессии ===
// На клиент уходит без rounds (поле optional, заполняется только серверным
// scoring при отладке). Клиент не должен полагаться на rounds.

export interface Publication {
  resultId: string;
  percentile: number | null;
  totalResults: number;
}

export interface SessionResult {
  rounds?: RoundResult[];
  aiq: number;
  modalityScores: Record<Modality, number>;
  biasProfile: BiasProfile;
  percentile?: number;
  completedAt?: number;
  publication?: Publication;
}

// === Server-only мapы ===

export const MODALITY_BY_TYPE: Record<ContentType, Modality> = {
  marketplace: 'text',
  bank: 'text',
  note: 'text',
  painting: 'image',
  landscape: 'image',
  catvideo: 'video',
  advideo: 'video',
  phonecall: 'audio',
  song: 'audio',
};

export const ROUND_TITLES: Record<ContentType, string> = {
  marketplace: 'Описания товаров',
  bank: 'Сообщения от банков',
  note: 'Заметки',
  painting: 'Картины',
  landscape: 'Пейзажи',
  catvideo: 'Видео с котятами',
  advideo: 'Рекламные ролики',
  phonecall: 'Телефонные звонки',
  song: 'Песни',
};

export const AUDIO_KIND_BY_TYPE: Partial<Record<ContentType, AudioKind>> = {
  phonecall: 'call',
  song: 'song',
};

// Длительность раунда в секундах. По модальности — дефолт; конкретные подкатегории
// могут переопределять. Видео-реклама длиннее котячьих роликов, поэтому отдельный
// бюджет (запас на просмотр обоих + ответ).
const MODALITY_DURATIONS: Record<Modality, number> = {
  text: 45,
  image: 30,
  video: 60,
  audio: 50,
};

const TYPE_DURATION_OVERRIDES: Partial<Record<ContentType, number>> = {
  catvideo: 60,
  advideo: 150,
};

export function getDurationSeconds(type: ContentType): number {
  const override = TYPE_DURATION_OVERRIDES[type];
  if (override !== undefined) return override;
  return MODALITY_DURATIONS[MODALITY_BY_TYPE[type]];
}

export type Modality = 'text' | 'image' | 'video' | 'audio';

export type ContentType =
  | 'marketplace'
  | 'bank'
  | 'ai-note'
  | 'painting'
  | 'landscape'
  | 'cat-video'
  | 'ad-video'
  | 'phone-call-a'
  | 'phone-call-b'
  | 'song';

export type Source = 'ai' | 'human';

export type BiasProfile = 'paranoid' | 'trusting' | 'balanced';

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

export interface SessionResult {
  rounds: RoundResult[];
  aiq: number;
  modalityScores: Record<Modality, number>;
  biasProfile: BiasProfile;
  percentile?: number;
  completedAt?: number;
}

export const MODALITY_BY_TYPE: Record<ContentType, Modality> = {
  marketplace: 'text',
  bank: 'text',
  'ai-note': 'text',
  painting: 'image',
  landscape: 'image',
  'cat-video': 'video',
  'ad-video': 'video',
  'phone-call-a': 'audio',
  'phone-call-b': 'audio',
  song: 'audio',
};

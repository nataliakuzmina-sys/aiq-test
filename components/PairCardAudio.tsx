'use client';

import type { ContentItem, ContentType, Source } from '../lib/types';
import { SourceToggle } from './SourceToggle';

interface PairCardAudioProps {
  item: ContentItem;
  label: Source | null;
  onChange: (value: Source) => void;
  disabled?: boolean;
}

interface AudioMeta {
  icon: string;
  label: string;
}

const AUDIO_META: Partial<Record<ContentType, AudioMeta>> = {
  'phone-call-a': { icon: '📞', label: 'Звонок' },
  'phone-call-b': { icon: '📞', label: 'Звонок' },
  song: { icon: '🎵', label: 'Песня' },
};

const FALLBACK: AudioMeta = { icon: '🔊', label: 'Аудио' };

export function PairCardAudio({
  item,
  label,
  onChange,
  disabled,
}: PairCardAudioProps) {
  const meta = AUDIO_META[item.type] ?? FALLBACK;

  return (
    <article className="flex flex-col gap-4 h-full bg-surface border border-border rounded-md p-5 shadow-card">
      <div className="flex flex-col items-center justify-center gap-3 aspect-[4/3] w-full bg-bg rounded-sm p-4">
        <span className="text-6xl leading-none" aria-hidden="true">
          {meta.icon}
        </span>
        <span className="text-muted font-medium">{meta.label}</span>
        <audio
          src={item.url ?? ''}
          controls
          preload="metadata"
          className="w-full max-w-xs mt-2"
          aria-label={`${meta.label} для оценки`}
        >
          Ваш браузер не поддерживает воспроизведение аудио.
        </audio>
      </div>
      <SourceToggle
        value={label}
        onChange={onChange}
        disabled={disabled}
        ariaLabel="Кто создал это аудио?"
      />
    </article>
  );
}

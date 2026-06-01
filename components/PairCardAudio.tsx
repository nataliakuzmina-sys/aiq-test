'use client';

import Image from 'next/image';
import type { ContentItem, ContentType, Source } from '../lib/types';
import { SourceToggle } from './SourceToggle';

interface PairCardAudioProps {
  item: ContentItem;
  label: Source | null;
  onChange: (value: Source) => void;
  disabled?: boolean;
}

interface AudioMeta {
  iconSrc: string;
  label: string;
}

const AUDIO_META: Partial<Record<ContentType, AudioMeta>> = {
  'phone-call-a': { iconSrc: '/icons/call.svg', label: 'Звонок' },
  'phone-call-b': { iconSrc: '/icons/call.svg', label: 'Звонок' },
  song: { iconSrc: '/icons/audio.svg', label: 'Песня' },
};

const FALLBACK: AudioMeta = { iconSrc: '/icons/audio.svg', label: 'Аудио' };

export function PairCardAudio({
  item,
  label,
  onChange,
  disabled,
}: PairCardAudioProps) {
  const meta = AUDIO_META[item.type] ?? FALLBACK;

  return (
    <article className="flex flex-col gap-4 h-full bg-background-display border border-border-selector rounded-sm p-5 shadow-card">
      <div className="flex flex-col items-center justify-center gap-3 aspect-[4/3] w-full bg-background-primary rounded-xs p-4">
        <Image
          src={meta.iconSrc}
          alt=""
          width={64}
          height={64}
          className="w-16 h-16"
          unoptimized
          aria-hidden="true"
        />
        <span className="text-text-secondary font-medium">{meta.label}</span>
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

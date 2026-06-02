'use client';

import type { PublicItem, Source } from '../lib/types';
import { SourceToggle } from './SourceToggle';

interface PairCardVideoProps {
  item: PublicItem;
  label: Source | null;
  onChange: (value: Source) => void;
  disabled?: boolean;
}

export function PairCardVideo({
  item,
  label,
  onChange,
  disabled,
}: PairCardVideoProps) {
  return (
    <article className="flex flex-col gap-4 h-full bg-background-display border border-border-selector rounded-sm p-5 shadow-card">
      <div className="aspect-video w-full bg-background-primary rounded-xs overflow-hidden">
        <video
          src={item.url ?? ''}
          playsInline
          controls
          preload="metadata"
          className="w-full h-full object-contain"
          aria-label="Видео для оценки"
        >
          Ваш браузер не поддерживает воспроизведение видео.
        </video>
      </div>
      <SourceToggle
        value={label}
        onChange={onChange}
        disabled={disabled}
        ariaLabel="Кто создал это видео?"
      />
    </article>
  );
}

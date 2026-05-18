'use client';

import type { ContentItem, Source } from '../lib/types';
import { SourceToggle } from './SourceToggle';

interface PairCardVideoProps {
  item: ContentItem;
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
    <article className="flex flex-col gap-4 h-full bg-surface border border-border rounded-md p-5 shadow-card">
      <div className="aspect-video w-full bg-bg rounded-sm overflow-hidden">
        <video
          src={item.url ?? ''}
          autoPlay
          muted
          loop
          playsInline
          controls
          preload="auto"
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

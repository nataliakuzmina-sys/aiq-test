'use client';

import type { ContentItem, Source } from '../lib/types';
import { SourceToggle } from './SourceToggle';

interface PairCardTextProps {
  item: ContentItem;
  label: Source | null;
  onChange: (value: Source) => void;
  disabled?: boolean;
}

export function PairCardText({
  item,
  label,
  onChange,
  disabled,
}: PairCardTextProps) {
  const preview = item.content?.slice(0, 50) ?? '';
  return (
    <article className="flex flex-col gap-4 h-full bg-background-display border border-border-selector rounded-sm p-5 shadow-card">
      <p className="flex-1 text-text-primary leading-relaxed whitespace-pre-wrap">
        {item.content ?? ''}
      </p>
      <SourceToggle
        value={label}
        onChange={onChange}
        disabled={disabled}
        ariaLabel={`Кто создал текст: ${preview}…`}
      />
    </article>
  );
}

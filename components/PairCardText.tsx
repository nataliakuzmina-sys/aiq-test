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
    <article className="flex flex-col gap-4 h-full bg-surface border border-border rounded-md p-5 shadow-card">
      <p className="flex-1 text-text leading-relaxed whitespace-pre-wrap">
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

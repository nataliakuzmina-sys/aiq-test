'use client';

import Image from 'next/image';
import type { PublicItem, Source } from '../lib/types';
import { SourceToggle } from './SourceToggle';

interface PairCardImageProps {
  item: PublicItem;
  label: Source | null;
  onChange: (value: Source) => void;
  disabled?: boolean;
}

export function PairCardImage({
  item,
  label,
  onChange,
  disabled,
}: PairCardImageProps) {
  return (
    <article className="flex flex-col gap-4 h-full bg-background-display border border-border-selector rounded-sm p-5 shadow-card">
      <div className="relative aspect-[4/3] w-full bg-background-primary rounded-xs overflow-hidden">
        <Image
          src={item.url ?? ''}
          alt="Изображение для оценки"
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-contain"
          priority
        />
      </div>
      <SourceToggle
        value={label}
        onChange={onChange}
        disabled={disabled}
        ariaLabel="Кто создал это изображение?"
      />
    </article>
  );
}

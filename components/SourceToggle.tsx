'use client';

import { useId } from 'react';
import type { Source } from '../lib/types';

interface SourceToggleProps {
  value: Source | null;
  onChange: (value: Source) => void;
  disabled?: boolean;
  /** ARIA-label на всю группу. */
  ariaLabel?: string;
}

export function SourceToggle({
  value,
  onChange,
  disabled = false,
  ariaLabel = 'Кто создал этот контент?',
}: SourceToggleProps) {
  const groupName = useId();

  return (
    <fieldset
      disabled={disabled}
      className="grid grid-cols-2 gap-2"
      aria-label={ariaLabel}
    >
      <Option
        name={groupName}
        source="ai"
        label="ИИ"
        checked={value === 'ai'}
        onChange={onChange}
      />
      <Option
        name={groupName}
        source="human"
        label="Человек"
        checked={value === 'human'}
        onChange={onChange}
      />
    </fieldset>
  );
}

interface OptionProps {
  name: string;
  source: Source;
  label: string;
  checked: boolean;
  onChange: (source: Source) => void;
}

function Option({ name, source, label, checked, onChange }: OptionProps) {
  return (
    <label>
      <input
        type="radio"
        name={name}
        value={source}
        checked={checked}
        onChange={() => onChange(source)}
        className="peer sr-only"
      />
      <span
        className={[
          'block w-full text-center px-4 py-3 rounded-sm border font-medium select-none cursor-pointer transition-colors',
          'border-border-selector bg-background-display text-text-primary',
          'peer-checked:bg-selector-primary peer-checked:text-text-inverse peer-checked:border-selector-primary',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-selector-primary peer-focus-visible:ring-offset-2',
          'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed',
        ].join(' ')}
      >
        {label}
      </span>
    </label>
  );
}

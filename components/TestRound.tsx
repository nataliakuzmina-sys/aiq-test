'use client';

import { useEffect, useRef, useState } from 'react';
import type {
  ContentItem,
  ContentType,
  Modality,
  Pair,
  RoundResult,
  Source,
} from '../lib/types';
import { PairCardAudio } from './PairCardAudio';
import { PairCardImage } from './PairCardImage';
import { PairCardText } from './PairCardText';
import { PairCardVideo } from './PairCardVideo';
import { ProgressBar } from './ProgressBar';
import { Timer } from './Timer';

interface TestRoundProps {
  pair: Pair;
  roundIndex: number;
  totalRounds: number;
  durationSeconds: number;
  onComplete: (result: RoundResult) => void;
}

const ROUND_TITLES: Record<ContentType, string> = {
  marketplace: 'Описания товара',
  bank: 'Сообщения банка',
  'ai-note': 'Заметки об ИИ',
  painting: 'Картины',
  landscape: 'Пейзажи',
  'cat-video': 'Видео с котятами',
  'ad-video': 'Рекламные ролики',
  'phone-call-a': 'Телефонные звонки',
  'phone-call-b': 'Телефонные звонки',
  song: 'Песни',
};

const TIMEOUT_TOAST_MS = 800;

export function TestRound({
  pair,
  roundIndex,
  totalRounds,
  durationSeconds,
  onComplete,
}: TestRoundProps) {
  const [labels, setLabels] = useState<[Source | null, Source | null]>([null, null]);
  const [timedOut, setTimedOut] = useState(false);
  const [showTimeoutToast, setShowTimeoutToast] = useState(false);

  // Стабильные ссылки: тайм-аут-эффект не должен перевыполняться при каждом
  // изменении labels или пересоздании onComplete родителем.
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const labelsRef = useRef(labels);
  labelsRef.current = labels;

  useEffect(() => {
    if (!showTimeoutToast) return;
    const id = setTimeout(() => {
      onCompleteRef.current({ pair, userLabels: labelsRef.current });
    }, TIMEOUT_TOAST_MS);
    return () => clearTimeout(id);
  }, [showTimeoutToast, pair]);

  function handleTimeout() {
    setTimedOut(true);
    setShowTimeoutToast(true);
  }

  function handleLabelChange(index: 0 | 1, value: Source) {
    if (timedOut) return;
    setLabels((prev) => (index === 0 ? [value, prev[1]] : [prev[0], value]));
  }

  function handleSubmit() {
    if (timedOut) return;
    if (labels[0] === null || labels[1] === null) return;
    onComplete({ pair, userLabels: labels });
  }

  const bothLabeled = labels[0] !== null && labels[1] !== null;
  const submitDisabled = !bothLabeled || timedOut;
  const title = ROUND_TITLES[pair.type];

  return (
    <div className="mx-auto w-full max-w-[1200px] flex flex-col gap-6 p-4 pb-24 md:p-8 md:pb-32">
      <ProgressBar current={roundIndex + 1} total={totalRounds} />

      <header className="flex items-center justify-between gap-4">
        <h1 className="text-xl md:text-2xl font-bold">{title}</h1>
        <Timer duration={durationSeconds} onTimeUp={handleTimeout} />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <PairCardSlot
          item={pair.items[0]}
          modality={pair.modality}
          label={labels[0]}
          onChange={(v) => handleLabelChange(0, v)}
          disabled={timedOut}
        />
        <PairCardSlot
          item={pair.items[1]}
          modality={pair.modality}
          label={labels[1]}
          onChange={(v) => handleLabelChange(1, v)}
          disabled={timedOut}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitDisabled}
          className={[
            'px-6 py-3 rounded-xs font-semibold text-base transition-colors',
            'bg-button-primary text-text-inverse',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'enabled:hover:bg-button-primary-hover',
            'focus-visible:ring-2 focus-visible:ring-button-primary focus-visible:ring-offset-2',
          ].join(' ')}
        >
          Далее
        </button>
      </div>

      {showTimeoutToast && (
        <div
          role="status"
          aria-live="assertive"
          className="fixed left-1/2 top-8 -translate-x-1/2 z-50 bg-text-primary text-text-inverse px-4 py-2 rounded-sm shadow-elevated"
        >
          Время истекло
        </div>
      )}
    </div>
  );
}

interface PairCardSlotProps {
  item: ContentItem;
  modality: Modality;
  label: Source | null;
  onChange: (value: Source) => void;
  disabled: boolean;
}

function PairCardSlot({
  item,
  modality,
  label,
  onChange,
  disabled,
}: PairCardSlotProps) {
  switch (modality) {
    case 'text':
      return <PairCardText item={item} label={label} onChange={onChange} disabled={disabled} />;
    case 'image':
      return <PairCardImage item={item} label={label} onChange={onChange} disabled={disabled} />;
    case 'video':
      return <PairCardVideo item={item} label={label} onChange={onChange} disabled={disabled} />;
    case 'audio':
      return <PairCardAudio item={item} label={label} onChange={onChange} disabled={disabled} />;
  }
}

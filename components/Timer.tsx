'use client';

import { useEffect, useRef, useState } from 'react';

interface TimerProps {
  /** Длительность раунда в секундах. */
  duration: number;
  /** Вызывается ровно один раз, когда счётчик достигает 0. */
  onTimeUp: () => void;
  className?: string;
}

export function Timer({ duration, onTimeUp, className }: TimerProps) {
  const [remaining, setRemaining] = useState(duration);

  // Стабильная ссылка на callback, чтобы перезапуск интервала не зависел
  // от того, мемоизирует ли родитель onTimeUp.
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  useEffect(() => {
    const start = Date.now();
    setRemaining(duration);
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const next = Math.max(0, duration - elapsed);
      setRemaining(next);
      if (next === 0) clearInterval(id);
    }, 250);
    return () => clearInterval(id);
  }, [duration]);

  useEffect(() => {
    if (remaining === 0) onTimeUpRef.current();
  }, [remaining]);

  const danger = remaining <= 5;
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const display =
    minutes > 0
      ? `${minutes}:${String(seconds).padStart(2, '0')}`
      : `${seconds}`;

  return (
    <div
      className={`inline-flex items-center font-mono tabular-nums text-lg ${className ?? ''}`}
      aria-live="polite"
      aria-label={`Осталось ${remaining} секунд`}
    >
      <span className={danger ? 'text-text-accent font-bold' : 'text-text-primary'}>
        {display}
      </span>
      <span className="ml-1 text-text-secondary text-sm">с</span>
    </div>
  );
}

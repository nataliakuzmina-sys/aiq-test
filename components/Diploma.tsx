import { forwardRef } from 'react';
import { getTitle } from '../lib/titles';
import type { BiasProfile, SessionResult } from '../lib/types';

interface DiplomaProps {
  session: SessionResult;
}

const BIAS_DISPLAY: Record<BiasProfile, { icon: string; name: string }> = {
  balanced: { icon: '⚖️', name: 'Сбалансированный' },
  paranoid: { icon: '🔍', name: 'Параноик' },
  trusting: { icon: '🤝', name: 'Доверчивый' },
};

function formatDate(ts: number | undefined): string {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export const Diploma = forwardRef<HTMLDivElement, DiplomaProps>(function Diploma(
  { session },
  ref,
) {
  const title = getTitle(session.aiq, session.biasProfile);
  const bias = BIAS_DISPLAY[session.biasProfile];
  const date = formatDate(session.completedAt);

  return (
    <div
      ref={ref}
      style={{ width: '1080px', height: '1920px', backgroundColor: '#FFFFFF' }}
      className="flex flex-col justify-between p-20 text-text"
    >
      <header className="flex justify-between items-center text-4xl text-muted font-semibold">
        <span>AIQ</span>
        <span>РБК × Kokoc</span>
      </header>

      <div className="flex flex-col items-center text-center gap-10">
        <p className="text-6xl text-muted">Ваш AIQ</p>
        <p
          className="font-extrabold leading-none text-primary tabular-nums"
          style={{ fontSize: '20rem' }}
        >
          {session.aiq}
        </p>
        <p className="text-7xl font-bold max-w-[900px] leading-tight">
          {title}
        </p>
      </div>

      <div className="flex flex-col items-center gap-6">
        <span className="text-9xl leading-none">{bias.icon}</span>
        <p className="text-5xl font-semibold">{bias.name}</p>
      </div>

      <footer className="flex justify-between items-end text-3xl text-muted">
        <span>{date}</span>
        <span>aiq-test-zeta.vercel.app</span>
      </footer>
    </div>
  );
});

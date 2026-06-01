import { forwardRef } from 'react';
import { getTitle } from '../lib/titles';
import type { BiasProfile, SessionResult } from '../lib/types';

interface DiplomaProps {
  session: SessionResult;
}

const BIAS_NAME: Record<BiasProfile, string> = {
  balanced: 'Сбалансированный',
  paranoid: 'Параноик',
  trusting: 'Доверчивый',
};

const DIPLOMA_BACKGROUND: Record<BiasProfile, string> = {
  balanced: '/diploma/diploma-balanced.png',
  paranoid: '/diploma/diploma-paranoid.png',
  trusting: '/diploma/diploma-trusting.png',
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
  const biasName = BIAS_NAME[session.biasProfile];
  const date = formatDate(session.completedAt);
  const bgSrc = DIPLOMA_BACKGROUND[session.biasProfile];

  return (
    <div
      ref={ref}
      style={{
        width: '1080px',
        height: '1920px',
        backgroundColor: '#FFFFFF',
        position: 'relative',
      }}
      className="text-text-primary"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={bgSrc}
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
        aria-hidden="true"
      />
      {/* Белая подложка с текстом — в верхней части PNG, ниже cobranding-логотипа */}
      <div
        style={{
          position: 'absolute',
          top: '260px',
          left: '80px',
          right: '80px',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '80px 60px',
        }}
        className="flex flex-col items-center text-center gap-10"
      >
        <p className="text-6xl text-text-secondary">Ваш AIQ</p>
        <p
          className="font-extrabold leading-none text-text-accent tabular-nums"
          style={{ fontSize: '16rem' }}
        >
          {session.aiq}
        </p>
        <p className="text-6xl font-bold max-w-[800px] leading-tight">
          {title}
        </p>
        <p className="text-4xl font-semibold text-text-secondary">{biasName}</p>
      </div>
      {/* Низ: дата + домен на «рукопожатии» */}
      <footer
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}
        className="flex justify-between items-end px-20 pb-16 text-3xl text-text-secondary"
      >
        <span>{date}</span>
        <span>aiq-test-zeta.vercel.app</span>
      </footer>
    </div>
  );
});

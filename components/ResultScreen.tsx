import Link from 'next/link';
import { getTitle } from '../lib/titles';
import type { BiasProfile, Modality, SessionResult } from '../lib/types';

interface ResultScreenProps {
  session: SessionResult;
}

interface BiasMeta {
  icon: string;
  name: string;
  hint: string;
}

const BIAS_META: Record<BiasProfile, BiasMeta> = {
  balanced: {
    icon: '⚖️',
    name: 'Сбалансированный',
    hint: 'Одинаково осторожны с ИИ и человеком.',
  },
  paranoid: {
    icon: '🔍',
    name: 'Параноик',
    hint: 'Часто видите ИИ там, где его нет.',
  },
  trusting: {
    icon: '🤝',
    name: 'Доверчивый',
    hint: 'Часто пропускаете ИИ, принимая его за человека.',
  },
};

interface ModalityMeta {
  icon: string;
  name: string;
}

const MODALITY_META: Record<Modality, ModalityMeta> = {
  text: { icon: '📝', name: 'Тексты' },
  image: { icon: '🖼️', name: 'Изображения' },
  video: { icon: '🎬', name: 'Видео' },
  audio: { icon: '🎵', name: 'Аудио' },
};

const MODALITY_ORDER: readonly Modality[] = ['text', 'image', 'video', 'audio'];

export function ResultScreen({ session }: ResultScreenProps) {
  const title = getTitle(session.aiq, session.biasProfile);
  const bias = BIAS_META[session.biasProfile];

  return (
    <main className="mx-auto w-full max-w-[900px] flex flex-col gap-10 p-4 md:p-8">
      <section className="flex flex-col items-center gap-3 text-center">
        <p className="text-muted text-lg">Ваш AIQ</p>
        <p className="text-8xl md:text-9xl font-bold leading-none text-primary tabular-nums">
          {session.aiq}
        </p>
        <p className="text-xl md:text-2xl font-semibold mt-2">{title}</p>
      </section>

      <section className="flex flex-col sm:flex-row items-center gap-4 bg-surface border border-border rounded-md p-5 shadow-card">
        <span className="text-5xl leading-none" aria-hidden="true">
          {bias.icon}
        </span>
        <div className="text-center sm:text-left">
          <p className="text-lg font-semibold">{bias.name}</p>
          <p className="text-muted text-sm">{bias.hint}</p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">По модальностям</h2>
        <div className="flex flex-col gap-3">
          {MODALITY_ORDER.map((m) => {
            const score = session.modalityScores[m];
            const meta = MODALITY_META[m];
            return (
              <div key={m} className="flex items-center gap-3">
                <span className="text-2xl w-8 text-center" aria-hidden="true">
                  {meta.icon}
                </span>
                <span className="w-28 text-text">{meta.name}</span>
                <div
                  className="flex-1 h-2 bg-border rounded-sm overflow-hidden"
                  role="progressbar"
                  aria-valuenow={score}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${meta.name}: ${score} из 100`}
                >
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${score}%` }}
                  />
                </div>
                <span className="w-12 text-right font-mono tabular-nums text-text">
                  {score}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col items-center gap-2">
        <div className="w-full aspect-[3/2] max-w-[600px] bg-bg border-2 border-dashed border-border rounded-md flex items-center justify-center text-muted">
          Здесь будет ваш диплом
        </div>
      </section>

      <section className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          type="button"
          disabled
          title="Скоро"
          className="px-6 py-3 rounded-md font-semibold bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Скачать диплом
          <span className="ml-2 text-xs font-normal opacity-80">Скоро</span>
        </button>
        <button
          type="button"
          disabled
          title="Скоро"
          className="px-6 py-3 rounded-md font-semibold border border-border bg-surface text-text disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Поделиться в Telegram
          <span className="ml-2 text-xs font-normal opacity-80">Скоро</span>
        </button>
      </section>

      <div className="text-center">
        <Link href="/" className="text-primary underline underline-offset-4">
          На главную
        </Link>
      </div>
    </main>
  );
}

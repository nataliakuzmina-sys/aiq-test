'use client';

import { toPng } from 'html-to-image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { getTitle } from '../lib/titles';
import type {
  BiasProfile,
  Modality,
  Publication,
  SessionResult,
} from '../lib/types';
import { Diploma } from './Diploma';
import { PublishForm } from './PublishForm';

interface ResultScreenProps {
  session: SessionResult;
  mode?: 'own' | 'shared';
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

const DIPLOMA_WIDTH = 1080;
const DIPLOMA_HEIGHT = 1920;
const RESULT_KEY = 'aiq_session_result';

export function ResultScreen({ session, mode = 'own' }: ResultScreenProps) {
  const title = getTitle(session.aiq, session.biasProfile);
  const bias = BIAS_META[session.biasProfile];
  const isShared = mode === 'shared';

  const previewBoxRef = useRef<HTMLDivElement>(null);
  const diplomaRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [publication, setPublication] = useState<Publication | null>(
    isShared ? null : session.publication ?? null,
  );
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isShared) {
      setShareUrl(window.location.href);
    } else if (publication) {
      setShareUrl(`${window.location.origin}/result/${publication.resultId}`);
    } else {
      setShareUrl(null);
    }
  }, [isShared, publication]);

  useEffect(() => {
    const el = previewBoxRef.current;
    if (!el) return;
    const update = () => setPreviewScale(el.clientWidth / DIPLOMA_WIDTH);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  async function handleDownload() {
    if (!diplomaRef.current || downloading) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(diplomaRef.current, {
        pixelRatio: 1,
        cacheBust: true,
        backgroundColor: '#FFFFFF',
        width: DIPLOMA_WIDTH,
        height: DIPLOMA_HEIGHT,
      });
      const link = document.createElement('a');
      link.download = `aiq-${session.aiq}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setDownloading(false);
    }
  }

  async function handlePublish(input: {
    displayName?: string;
    showInLeaderboard: boolean;
  }) {
    const body = {
      aiq: session.aiq,
      modalityText: session.modalityScores.text,
      modalityImage: session.modalityScores.image,
      modalityVideo: session.modalityScores.video,
      modalityAudio: session.modalityScores.audio,
      biasProfile: session.biasProfile,
      displayName: input.displayName,
      showInLeaderboard: input.showInLeaderboard,
    };
    const res = await fetch('/api/submit-result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error || 'Не удалось опубликовать. Попробуйте ещё раз.');
    }
    const data = (await res.json()) as Publication;
    const updatedSession: SessionResult = { ...session, publication: data };
    sessionStorage.setItem(RESULT_KEY, JSON.stringify(updatedSession));
    setPublication(data);
  }

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

      <section className="flex flex-col items-center gap-3">
        <h2 className="text-lg font-semibold self-start">Диплом</h2>
        <div
          ref={previewBoxRef}
          className="w-full max-w-[400px] aspect-[9/16] overflow-hidden bg-bg rounded-md shadow-card border border-border"
        >
          {previewScale > 0 && (
            <div
              style={{
                width: `${DIPLOMA_WIDTH}px`,
                height: `${DIPLOMA_HEIGHT}px`,
                transform: `scale(${previewScale})`,
                transformOrigin: 'top left',
              }}
            >
              <Diploma ref={diplomaRef} session={session} />
            </div>
          )}
        </div>
      </section>

      <section className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="px-6 py-3 rounded-md font-semibold bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:bg-primary/90"
        >
          {downloading ? 'Генерируем…' : 'Скачать диплом'}
        </button>
        {shareUrl ? (
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Мой AIQ: ${session.aiq}. ${title}.`)}`}
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 rounded-md font-semibold border border-border bg-surface text-text text-center hover:bg-bg"
          >
            Поделиться в Telegram
          </a>
        ) : (
          <button
            type="button"
            disabled
            title="Опубликуйте, чтобы поделиться"
            className="px-6 py-3 rounded-md font-semibold border border-border bg-surface text-text disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Поделиться в Telegram
            <span className="ml-2 text-xs font-normal opacity-80">
              после публикации
            </span>
          </button>
        )}
      </section>

      {!isShared && (
        publication === null ? (
          <PublishForm onPublish={handlePublish} />
        ) : (
          <section className="flex flex-col gap-3 bg-surface border border-border rounded-md p-5 shadow-card">
            <h2 className="text-lg font-semibold">Опубликовано</h2>
            <p className="text-text">
              {publication.percentile === null
                ? `Вы среди первых ${publication.totalResults} прошедших.`
                : `Вы лучше чем ${publication.percentile}% прошедших.`}
            </p>
          </section>
        )
      )}

      <div className="text-center">
        <Link href="/" className="text-primary underline underline-offset-4">
          На главную
        </Link>
      </div>
    </main>
  );
}

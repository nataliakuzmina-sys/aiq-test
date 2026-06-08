'use client';

import { toPng } from 'html-to-image';
import Image from 'next/image';
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
  iconSrc?: string;
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
    name: 'Мнительный',
    hint: 'Часто видите ИИ там, где его нет.',
  },
  trusting: {
    icon: '🤝',
    iconSrc: '/icons/trustful.svg',
    name: 'Доверчивый',
    hint: 'Часто пропускаете ИИ, принимая его за человека.',
  },
};

interface ModalityMeta {
  iconSrc: string;
  name: string;
}

const MODALITY_META: Record<Modality, ModalityMeta> = {
  text: { iconSrc: '/icons/text.svg', name: 'Тексты' },
  image: { iconSrc: '/icons/image.svg', name: 'Изображения' },
  video: { iconSrc: '/icons/video.svg', name: 'Видео' },
  audio: { iconSrc: '/icons/audio.svg', name: 'Аудио' },
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
    <main className="flex-1 flex flex-col overflow-x-hidden">
      <section className="relative w-full overflow-hidden min-h-[280px] md:min-h-[360px] flex items-center">
        <picture className="absolute inset-0 w-full h-full">
          <source media="(min-width: 1280px)" srcSet="/illustrations/result/result-1920.png" />
          <source media="(min-width: 768px)" srcSet="/illustrations/result/result-1280.png" />
          <source media="(min-width: 360px)" srcSet="/illustrations/result/result-768.png" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/illustrations/result/result-360.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center"
            loading="eager"
            aria-hidden="true"
          />
        </picture>
        <div className="relative z-10 mx-auto w-full max-w-[600px] flex flex-col items-center gap-2 text-center px-4 py-12 md:py-16">
          <p className="text-text-secondary text-base">Ваш AIQ</p>
          <p className="text-7xl md:text-8xl font-bold leading-none text-text-accent tabular-nums">
            {session.aiq}
          </p>
          <p className="text-lg md:text-xl font-semibold mt-1">{title}</p>
        </div>
      </section>

      <div className="flex flex-col gap-4 pb-8 -mt-16 relative z-10">
        {/* Profile card — white wrapper, grey plate inside, overlaps hero */}
        <section className="bg-background-display rounded-[80px] px-8 md:px-16 lg:px-32 py-8 md:py-12 shadow-card">
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-background-primary rounded-2xl p-4 md:p-5">
            {bias.iconSrc ? (
              <Image
                src={bias.iconSrc}
                alt=""
                width={48}
                height={48}
                className="w-12 h-12 flex-shrink-0"
                unoptimized
                aria-hidden="true"
              />
            ) : (
              <span className="text-4xl leading-none flex-shrink-0" aria-hidden="true">
                {bias.icon}
              </span>
            )}
            <div className="text-center sm:text-left">
              <p className="text-lg font-semibold">{bias.name}</p>
              <p className="text-text-secondary text-sm">{bias.hint}</p>
            </div>
          </div>
        </section>

        {/* По модальностям — white wrapper, 4 grey plates inside */}
        <section className="bg-background-display rounded-[80px] px-8 md:px-16 lg:px-32 py-8 md:py-12 shadow-card flex flex-col gap-4">
          <h2 className="text-xl font-bold text-center">По модальностям</h2>
          <div className="flex flex-col gap-4">
            {MODALITY_ORDER.map((m) => {
              const score = session.modalityScores[m];
              const meta = MODALITY_META[m];
              return (
                <div
                  key={m}
                  className="flex items-center gap-3 bg-background-primary rounded-2xl p-4"
                >
                  <Image
                    src={meta.iconSrc}
                    alt=""
                    width={24}
                    height={24}
                    className="w-6 h-6 flex-shrink-0"
                    unoptimized
                    aria-hidden="true"
                  />
                  <span className="w-24 sm:w-28 text-text-primary text-sm sm:text-base">
                    {meta.name}
                  </span>
                  <div
                    className="flex-1 h-2 bg-background-display rounded-xs overflow-hidden"
                    role="progressbar"
                    aria-valuenow={score}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${meta.name}: ${score} из 100`}
                  >
                    <div
                      className="h-full bg-button-primary"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <span className="w-10 text-right font-mono tabular-nums text-text-secondary text-sm">
                    {score}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Diploma + Publish — single white section, grey plate with form inside */}
        <section className="bg-background-display rounded-[80px] px-8 md:px-16 lg:px-32 py-8 md:py-12 shadow-card flex flex-col items-center gap-4">
          <h2 className="text-xl font-bold">Диплом</h2>
          <div
            ref={previewBoxRef}
            className="w-full max-w-[400px] aspect-[9/16] overflow-hidden bg-background-primary rounded-xs"
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
          <div className="flex flex-col sm:flex-row gap-3 justify-center w-full">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="px-6 py-3 rounded-xs font-semibold bg-button-primary text-text-inverse disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:bg-button-primary-hover"
            >
              {downloading ? 'Генерируем…' : 'Скачать диплом'}
            </button>
            {shareUrl ? (
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Мой AIQ: ${session.aiq}. ${title}.`)}`}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-xs font-semibold border border-button-primary bg-background-display text-text-accent text-center hover:bg-background-primary"
              >
                Поделиться в Telegram
              </a>
            ) : (
              <button
                type="button"
                disabled
                title="Опубликуйте, чтобы поделиться"
                className="px-6 py-3 rounded-xs font-semibold border border-button-primary-disabled bg-background-display text-text-accent-disabled disabled:cursor-not-allowed"
              >
                Поделиться в Telegram
                <span className="ml-2 text-xs font-normal opacity-80">
                  после публикации
                </span>
              </button>
            )}
          </div>

          {/* Publish form / publication status — grey plate inside diploma section */}
          {!isShared && (
            <div className="w-full bg-background-primary rounded-2xl p-4 md:p-6 mt-4">
              {publication === null ? (
                <PublishForm onPublish={handlePublish} />
              ) : (
                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-bold">Опубликовано</h2>
                  <p className="text-text-primary">
                    {publication.percentile === null
                      ? `Вы среди первых ${publication.totalResults} прошедших.`
                      : `Ваш AIQ выше, чем у ${publication.percentile}% прошедших`}
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        <div className="text-center pt-2">
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-xs bg-button-primary text-text-inverse font-semibold hover:bg-button-primary-hover"
          >
            На главную
          </Link>
        </div>
      </div>
    </main>
  );
}

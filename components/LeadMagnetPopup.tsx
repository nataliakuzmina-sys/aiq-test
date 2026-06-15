'use client';

import { useEffect, useState } from 'react';

interface LeadMagnetPopupProps {
  delaySeconds: number;
  enableExitIntent: boolean;
  storageKey: string;
}

const COPY = {
  title: 'ИИ для бизнеса — три прикладных материала',
  subtitle: 'Забирайте подборку от Kokoc Group:',
  bullets: [
    {
      lead: 'Гайд',
      tail:
        ': промпты для реалистичной графики в стиле вашего бренда — без дешёвого AI-эффекта',
    },
    {
      lead: 'GEO чек-лист',
      tail: ': как настроить сайт, чтобы бренд рекомендовали нейросети',
    },
    {
      lead: 'Кейс',
      tail:
        ': замена съёмок на ИИ-персонажа — х5 экономия на продакшн, +69% просмотров в соцсетях',
    },
  ],
  cta: 'Забрать в Telegram',
  caption:
    'При клике на кнопку вы перейдете в Telegram-бот Платформы Kokoc Group',
};

const TG_URL = 'https://t.me/kokoc_platform_bot?start=3718651';

export function LeadMagnetPopup({
  delaySeconds,
  enableExitIntent,
  storageKey,
}: LeadMagnetPopupProps) {
  const [mounted, setMounted] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(storageKey) === '1') return;

    let timerId: ReturnType<typeof setTimeout> | undefined;
    let removeExitIntent = () => {};

    const show = () => {
      if (sessionStorage.getItem(storageKey) === '1') return;
      sessionStorage.setItem(storageKey, '1');
      setMounted(true);
      requestAnimationFrame(() => setAnimateIn(true));
      if (timerId) clearTimeout(timerId);
      removeExitIntent();
    };

    timerId = setTimeout(show, delaySeconds * 1000);

    if (
      enableExitIntent &&
      typeof window !== 'undefined' &&
      window.matchMedia('(min-width: 768px)').matches
    ) {
      const onMouseOut = (e: MouseEvent) => {
        if (e.clientY <= 0) show();
      };
      window.addEventListener('mouseout', onMouseOut);
      removeExitIntent = () =>
        window.removeEventListener('mouseout', onMouseOut);
    }

    return () => {
      if (timerId) clearTimeout(timerId);
      removeExitIntent();
    };
  }, [delaySeconds, enableExitIntent, storageKey]);

  if (!mounted) return null;

  function handleClose() {
    setAnimateIn(false);
    setTimeout(() => setMounted(false), 300);
  }

  return (
    <div
      role="dialog"
      aria-label="Полезные материалы от Kokoc Group"
      className={[
        'fixed z-50 bg-background-display shadow-elevated',
        'left-0 right-0 bottom-0 rounded-t-xl p-5 pt-6',
        'sm:left-auto sm:right-6 sm:bottom-6 sm:w-[380px] sm:rounded-xl',
        'transition-all duration-300 ease-out',
        animateIn
          ? 'translate-y-0 opacity-100'
          : 'translate-y-full opacity-0',
      ].join(' ')}
    >
      <button
        type="button"
        onClick={handleClose}
        aria-label="Закрыть"
        className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full text-text-secondary hover:text-text-primary hover:bg-background-primary"
      >
        ✕
      </button>
      <h3 className="text-base font-bold pr-8 leading-tight">{COPY.title}</h3>
      <p className="text-sm text-text-secondary mt-2">{COPY.subtitle}</p>
      <ul className="mt-3 list-disc pl-5 flex flex-col gap-3 text-sm text-text-primary leading-snug marker:text-text-secondary">
        {COPY.bullets.map((b) => (
          <li key={b.lead}>
            <strong className="font-semibold">{b.lead}</strong>
            {b.tail}
          </li>
        ))}
      </ul>
      <a
        href={TG_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClose}
        className="mt-4 block w-full px-6 py-3 rounded-xs bg-button-primary text-text-inverse text-base font-semibold text-center hover:bg-button-primary-hover"
      >
        {COPY.cta}
      </a>
      <p className="mt-2 text-[10px] text-text-secondary leading-tight text-left">
        {COPY.caption}
      </p>
    </div>
  );
}

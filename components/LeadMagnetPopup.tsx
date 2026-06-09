'use client';

import { useEffect, useState } from 'react';

interface LeadMagnetPopupProps {
  place: 'landing' | 'result';
  delaySeconds: number;
  enableExitIntent: boolean;
  storageKey: string;
}

const COPY = {
  title: 'Заберите полезные материалы от Kokoc Group',
  subtitle: 'Выберите, что ближе — и забирайте в Telegram.',
  offers: [
    {
      slug: 'guide',
      text: 'Гайд: как создавать ИИ-контент, который выглядит дорого',
      cta: 'Забрать гайд',
    },
    {
      slug: 'seo',
      text:
        'Бесплатная консультация: как перестроить SEO и стать видимым для нейросетей',
      cta: 'Записаться',
    },
  ],
};

const TG_BASE = 'https://t.me/kokoc_platform_bot';

export function LeadMagnetPopup({
  place,
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
      // следующая микро-итерация — добавляем класс анимации, slide-in
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
    // Дать анимации завершиться, потом размонтировать
    setTimeout(() => setMounted(false), 300);
  }

  function offerLink(slug: string) {
    return `${TG_BASE}?start=aiq_${place}_${slug}`;
  }

  return (
    <div
      role="dialog"
      aria-label="Полезные материалы от Kokoc"
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
      <div className="mt-4 flex flex-col gap-4">
        {COPY.offers.map((o) => (
          <div key={o.slug} className="flex flex-col gap-2">
            <p className="text-sm text-text-primary leading-snug">{o.text}</p>
            <a
              href={offerLink(o.slug)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClose}
              className="self-start px-4 py-2 rounded-xs bg-button-primary text-text-inverse text-sm font-semibold hover:bg-button-primary-hover"
            >
              {o.cta}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

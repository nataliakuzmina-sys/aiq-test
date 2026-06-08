import Link from 'next/link';

export function SiteHeader() {
  return (
    <header className="w-full border-b border-border-selector bg-background-primary">
      <div className="mx-auto w-full max-w-[1200px] flex items-center justify-between px-4 md:px-8 py-4">
        <Link href="/" aria-label="На главную" className="inline-flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/cobranding.svg"
            alt="Kokoc × РБК"
            className="h-8 md:h-10 w-auto"
          />
        </Link>
        <nav className="flex gap-5 text-sm">
          <Link href="/leaderboard" className="text-text-primary hover:text-text-accent">
            Рейтинг
          </Link>
          <Link href="/methodology" className="text-text-primary hover:text-text-accent">
            Методология
          </Link>
        </nav>
      </div>
    </header>
  );
}

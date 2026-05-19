import Link from 'next/link';

export function SiteHeader() {
  return (
    <header className="w-full border-b border-border bg-bg">
      <div className="mx-auto w-full max-w-[1200px] flex items-center justify-between px-4 md:px-8 py-4">
        <Link href="/" className="text-xl font-extrabold text-primary">
          AIQ
        </Link>
        <nav className="flex gap-5 text-sm">
          <Link href="/leaderboard" className="text-text hover:text-primary">
            Лидерборд
          </Link>
          <Link href="/methodology" className="text-text hover:text-primary">
            Методология
          </Link>
        </nav>
      </div>
    </header>
  );
}

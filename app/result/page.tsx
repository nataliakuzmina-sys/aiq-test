'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const RESULT_KEY = 'aiq_session_result';

export default function ResultPage() {
  const [raw, setRaw] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setRaw(sessionStorage.getItem(RESULT_KEY));
    setChecked(true);
  }, []);

  if (!checked) return <div aria-hidden="true" />;

  if (!raw) {
    return (
      <main className="mx-auto w-full max-w-[600px] flex flex-col items-center gap-4 p-8 text-center">
        <h1 className="text-2xl font-bold">Нет результата</h1>
        <p className="text-muted">Сначала пройдите тест.</p>
        <Link
          href="/"
          className="px-5 py-3 rounded-md bg-primary text-white font-semibold"
        >
          На главную
        </Link>
      </main>
    );
  }

  let pretty: string;
  try {
    pretty = JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    pretty = raw;
  }

  return (
    <main className="mx-auto w-full max-w-[900px] p-8 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Результат (заглушка)</h1>
      <pre className="bg-surface border border-border rounded-md p-4 text-xs overflow-auto whitespace-pre-wrap">
        {pretty}
      </pre>
      <Link
        href="/"
        className="self-start px-5 py-3 rounded-md bg-primary text-white font-semibold"
      >
        На главную
      </Link>
    </main>
  );
}

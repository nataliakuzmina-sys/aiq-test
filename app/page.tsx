import Link from 'next/link';

interface ModalityCard {
  icon: string;
  name: string;
  description: string;
}

const MODALITIES: readonly ModalityCard[] = [
  { icon: '📝', name: 'Тексты', description: 'Описания товаров, банковские сообщения, заметки' },
  { icon: '🖼️', name: 'Изображения', description: 'Картины и пейзажи' },
  { icon: '🎬', name: 'Видео', description: 'Видео с котятами и рекламные ролики' },
  { icon: '🎵', name: 'Аудио', description: 'Телефонные звонки и песни' },
];

export default function LandingPage() {
  return (
    <main className="flex-1 flex flex-col">
      <section className="mx-auto w-full max-w-[900px] flex flex-col items-center text-center gap-6 px-4 md:px-8 py-16 md:py-24">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
          Различи ИИ от человека
          <span className="block text-base font-normal text-text-secondary mt-2">
            [заголовок для копирайтера]
          </span>
        </h1>
        <p className="text-lg md:text-xl text-text-secondary max-w-[600px]">
          Тест для маркетологов: 8 раундов на текст, изображения, видео и звук.
          Узнайте свой балл AIQ и поделитесь дипломом.
          <span className="block text-sm mt-2 italic">[подзаголовок для копирайтера]</span>
        </p>
        <Link
          href="/test"
          className="inline-block px-8 py-4 rounded-sm bg-button-primary text-text-inverse text-lg font-semibold shadow-elevated hover:bg-button-primary-hover"
        >
          Пройти тест
        </Link>
        <p className="text-sm text-text-secondary">5–7 минут, 8 раундов, без регистрации</p>
      </section>

      <section className="bg-background-display border-y border-border-selector">
        <div className="mx-auto w-full max-w-[1200px] px-4 md:px-8 py-12 md:py-16 flex flex-col gap-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center">
            Что мы измеряем
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {MODALITIES.map((m) => (
              <div
                key={m.name}
                className="flex flex-col items-center text-center gap-3 p-5 bg-background-primary rounded-sm border border-border-selector"
              >
                <span className="text-5xl leading-none" aria-hidden="true">
                  {m.icon}
                </span>
                <h3 className="text-lg font-semibold">{m.name}</h3>
                <p className="text-sm text-text-secondary">{m.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

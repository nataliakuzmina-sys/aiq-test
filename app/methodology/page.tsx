import Link from 'next/link';

export const metadata = {
  title: 'Методология — AIQ',
  description: 'Как устроен тест, откуда контент и как считается балл AIQ.',
};

export default function MethodologyPage() {
  return (
    <main className="mx-auto w-full max-w-[800px] flex flex-col gap-10 p-4 md:p-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl md:text-4xl font-bold">Методология</h1>
        <p className="text-text-secondary text-lg">
          Как устроен тест AIQ, откуда взят контент и по какой формуле считается балл.
        </p>
      </header>

      <Section title="Как устроен тест">
        <p>
          Каждый прохождение — 8 раундов. В каждом раунде показывают два варианта
          одной категории (например, две картины или два звонка), и нужно
          определить, какой из них создан ИИ, а какой — человеком.
        </p>
        <p>
          Распределение раундов по модальностям одинаково для всех:
          2 текстовых, 2 на изображения, 2 на видео и 2 на аудио. Конкретные
          пары выбираются случайным образом на сервере — у разных пользователей
          набор различается.
        </p>
        <p>
          На каждый раунд отведено фиксированное время: 45 секунд на текст,
          30 — на изображение, 60 — на видео, 50 — на аудио. Если таймер
          истёк, оставшиеся неразмеченные ответы засчитываются как
          неправильные. Вернуться к предыдущему раунду нельзя.
        </p>
      </Section>

      <Section title="Откуда контент">
        <p className="text-text-secondary italic">
          [Заглушка для копирайтера] Описать, какие ИИ-модели использованы
          (например, для текстов, изображений, видео и аудио), и откуда взят
          человеческий материал (открытые источники, договорённости с авторами).
        </p>
        <p>
          Все 34 единицы контента заранее размечены автором исследования.
          Разметка перепроверена независимо.
        </p>
      </Section>

      <Section title="Как считается AIQ">
        <p>
          Балл AIQ — это процент правильных ответов из 16 размеченных пунктов
          (8 раундов × 2 варианта), округлённый до целого.
        </p>
        <p>
          Кроме общего балла, мы показываем профиль смещения:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Сбалансированный</strong> — ошибки распределены примерно
            поровну между «принял ИИ за человека» и «принял человека за ИИ».
          </li>
          <li>
            <strong>Параноик</strong> — чаще ошибается в сторону «это ИИ»,
            склонен подозревать машинное происхождение.
          </li>
          <li>
            <strong>Доверчивый</strong> — чаще ошибается в сторону «это человек»,
            склонен пропускать машинное происхождение.
          </li>
        </ul>
        <p>
          Профиль определяется по разнице между ложными срабатываниями (false
          positive) и пропусками (false negative) с порогом ±2.
        </p>
      </Section>

      <Section title="Кто стоит за исследованием">
        <p className="text-text-secondary italic">
          [Заглушка для копирайтера] Короткое описание партнёрства РБК × Kokoc
          и того, зачем мы это делаем (зачем индустрии замерять различимость
          ИИ-контента).
        </p>
      </Section>

      <Section title="Контакты для прессы">
        <p>
          По вопросам публикаций и комментариев:{' '}
          <a href="mailto:press@aiq.example" className="text-text-accent underline">
            press@aiq.example
          </a>
        </p>
      </Section>

      <div className="text-center pt-4">
        <Link href="/" className="text-text-accent underline underline-offset-4">
          На главную
        </Link>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
      <div className="flex flex-col gap-3 text-text-primary leading-relaxed">
        {children}
      </div>
    </section>
  );
}

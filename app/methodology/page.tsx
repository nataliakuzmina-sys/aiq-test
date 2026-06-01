import Link from 'next/link';

export const metadata = {
  title: 'Методология — AIQ',
  description:
    'Как устроен тест, откуда материалы и по какой формуле рассчитывается уровень ИИ-зоркости.',
};

export default function MethodologyPage() {
  return (
    <main className="mx-auto w-full max-w-[800px] flex flex-col gap-10 p-4 md:p-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-4xl md:text-6xl font-extrabold text-text-accent leading-tight">
          Методология
        </h1>
        <p className="text-text-secondary text-lg">
          Как устроен тест, откуда материалы и по какой формуле рассчитывается
          уровень ИИ-зоркости.
        </p>
      </header>

      <Section title="Как устроен тест">
        <p>
          Каждое прохождение состоит из <strong>8 раундов</strong> — по 2 на
          каждую категорию (текст, изображения, видео и аудио).
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Механика:</strong> в каждом раунде показываются два объекта.
            Задача — определить автора (Человек или ИИ) для каждого из них по
            отдельности. В паре могут оказаться два текста от ИИ или два видео
            от человека. Логика исключения здесь не работает.
          </li>
          <li>
            <strong>Таймер:</strong> на размышления дается фиксированное время
            (45 секунд на текст, 30 — на изображение, 60 — на видео, 50 — на
            аудио). Если время истекло, неотмеченные варианты засчитываются как
            неверные. Вернуться назад нельзя.
          </li>
          <li>
            <strong>Уникальность:</strong> система собирает каждый тест случайно
            из общей базы, поэтому у разных пользователей наборы заданий
            отличаются.
          </li>
        </ul>
      </Section>

      <Section title="Откуда контент">
        <p>
          В базе теста содержатся материалы, созданные реальными авторами и
          нейросетями.
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>ИИ-контент</strong> сгенерирован в нейросетях ChatGPT и
            Gemini.
          </li>
          <li>
            <strong>Человеческий контент</strong> взят из открытых источников
            или записан авторами специально для проекта.
          </li>
          <li>
            <strong>Верификация:</strong> все 34 единицы контента заранее
            размечены автором исследования. Разметка перепроверена независимо.
          </li>
        </ul>
      </Section>

      <Section title="Как считается балл AIQ">
        <p>
          В тесте оцениваются <strong>16 пунктов</strong> (8 раундов × 2
          объекта в каждом). Итоговый балл AIQ — это процент правильных ответов,
          округленный до целого числа.
        </p>
        <p>
          Помимо общего балла, система определяет ваш{' '}
          <strong>профиль восприятия</strong>. Он зависит от того, в какую
          сторону вы ошибались чаще:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Сбалансированный</strong> — вы одинаково хорошо (или
            ошибочно) воспринимаете и человека, и машину. Ошибки распределены
            поровну.
          </li>
          <li>
            <strong>Параноик</strong> — вы склонны видеть след робота во всем.
            Чаще ошибались, принимая реальное творчество человека за генерацию
            ИИ.
          </li>
          <li>
            <strong>Доверчивый</strong> — вы очеловечиваете технологии. Чаще
            ошибались, принимая качественную генерацию нейросети за работу
            человека.
          </li>
        </ul>
        <p>
          Профиль определяется по разнице между ложными срабатываниями (false
          positive) и пропусками (false negative) с порогом ±2.
        </p>
      </Section>

      <Section title="Кто стоит за проектом">
        <p>
          Спецпроект подготовлен <strong>Kokoc Group</strong> совместно с{' '}
          <strong>РБК</strong>.
        </p>
        <p>
          <strong>Зачем мы это делаем?</strong>
        </p>
        <p>
          ИИ развивается быстрее, чем наши фильтры восприятия, и digital-рынку
          необходим понятный инструмент для оценки реальности.
        </p>
        <p>
          Этот тест — результат масштабного исследования различимости
          ИИ-контента. Он наглядно демонстрирует, способна ли индустрия прямо
          сейчас распознавать синтетические материалы в ежедневных рабочих
          задачах.
        </p>
        <p>
          Мы создали этот проект, чтобы помочь специалистам замерить свою
          ИИ-зоркость, увидеть слепые зоны и адаптироваться к новой цифровой
          реальности.
        </p>
      </Section>

      <Section title="Контакты для прессы">
        <p>
          По вопросам публикаций результатов исследования и комментариев
          экспертов:{' '}
          <a href="mailto:pr@kokocgroup.ru" className="text-text-accent underline">
            pr@kokocgroup.ru
          </a>
        </p>
      </Section>

      <div className="text-center pt-4">
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-xs bg-button-primary text-text-inverse font-semibold hover:bg-button-primary-hover"
        >
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

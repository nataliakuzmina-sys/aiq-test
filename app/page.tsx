import Image from 'next/image';
import Link from 'next/link';
import { LeadMagnetPopup } from '../components/LeadMagnetPopup';

interface ModalityCard {
  iconSrc: string;
  name: string;
  description: string;
}

const MODALITIES: readonly ModalityCard[] = [
  {
    iconSrc: '/icons/text.svg',
    name: 'Тексты',
    description: 'Описания товаров, сообщения, информационные тексты',
  },
  {
    iconSrc: '/icons/image.svg',
    name: 'Изображения',
    description: 'Картины и фотографии',
  },
  {
    iconSrc: '/icons/video.svg',
    name: 'Видео',
    description: 'Видео с котятами и рекламные ролики',
  },
  {
    iconSrc: '/icons/audio.svg',
    name: 'Аудио',
    description: 'Телефонные звонки и песни',
  },
];

interface HowItWorksItem {
  title: string;
  text: string;
}

const HOW_IT_WORKS: readonly HowItWorksItem[] = [
  {
    title: '8 быстрых раундов',
    text: 'В каждом раунде показаны два объекта из одной группы, на выбор отведено от 30 до 150 секунд.',
  },
  {
    title: 'Случайный набор',
    text: 'Система собирает раунды случайно, поэтому у каждого пользователя свой набор заданий. Вернуться назад и исправить ответ нельзя.',
  },
  {
    title: 'Нет логики исключения',
    text: 'В паре не обязательно будут «один человек и одна нейросеть». Вам могут также попасться два ИИ-варианта или две работы человека.',
  },
];

export default function LandingPage() {
  return (
    <main className="flex-1 flex flex-col">
      <section className="relative w-full overflow-hidden min-h-[500px] md:min-h-[600px] flex items-center">
        <picture className="absolute inset-0 w-full h-full">
          <source media="(min-width: 1280px)" srcSet="/illustrations/hero/hero.png" />
          <source media="(min-width: 768px)" srcSet="/illustrations/hero/hero-1280.png" />
          <source media="(min-width: 360px)" srcSet="/illustrations/hero/hero-768.png" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/illustrations/hero/hero-360.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center"
            loading="eager"
            aria-hidden="true"
          />
        </picture>
        <div className="relative z-10 mx-auto w-full max-w-[900px] flex flex-col items-center text-center gap-6 px-4 md:px-8 py-16 md:py-24">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            Человек или ИИ? Проверьте свой AIQ (индекс ИИ-зоркости)
          </h1>
          <p className="text-lg md:text-xl text-text-secondary max-w-[700px]">
            Определите, что создано человеком, а где поработала нейросеть.
            8 раундов с текстом, графикой, аудио и видео. Докажите, что эксперта
            не обмануть, и заберите диплом
          </p>
          <Link
            href="/test"
            className="inline-block px-8 py-4 rounded-xs bg-button-primary text-text-inverse text-lg font-semibold shadow-elevated hover:bg-button-primary-hover"
          >
            Пройти тест
          </Link>
        </div>
      </section>

      <section className="bg-background-display rounded-[80px] shadow-card -mt-16 relative z-10 px-8 md:px-16 lg:px-32 py-8 md:py-12 flex flex-col gap-8">
        <h2 className="text-xl md:text-2xl font-bold text-center">
          Что внутри теста
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {MODALITIES.map((m) => (
            <div
              key={m.name}
              className="flex flex-col items-center text-center gap-3 p-5 bg-background-primary rounded-2xl"
            >
              <Image
                src={m.iconSrc}
                alt=""
                width={20}
                height={20}
                className="w-5 h-5"
                unoptimized
                aria-hidden="true"
              />
              <h3 className="text-lg font-semibold">{m.name}</h3>
              <p className="text-sm text-text-secondary">{m.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-background-display rounded-[80px] shadow-card mt-4 px-8 md:px-16 lg:px-32 py-8 md:py-12 flex flex-col gap-8">
        <h2 className="text-xl md:text-2xl font-bold text-center">
          Как всё устроено
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {HOW_IT_WORKS.map((item) => (
            <div
              key={item.title}
              className="flex flex-col gap-2 p-5 bg-background-primary rounded-2xl"
            >
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="text-sm text-text-secondary">{item.text}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <Link
            href="/test"
            className="inline-block px-8 py-4 rounded-xs bg-button-primary text-text-inverse text-lg font-semibold shadow-elevated hover:bg-button-primary-hover"
          >
            Начать
          </Link>
        </div>
      </section>
      <LeadMagnetPopup
        place="landing"
        delaySeconds={180}
        enableExitIntent={true}
        storageKey="aiq_popup_landing_shown"
      />
    </main>
  );
}

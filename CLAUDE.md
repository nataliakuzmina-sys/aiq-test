# CLAUDE.md

Этот файл читай в начале каждой сессии. Здесь — техническое ТЗ и конвенции проекта. Продуктовое описание — в `PRD.md` (читай его тоже).

## О проекте

AIQ — это виральный одностраничный квиз. Пользователь различает контент, созданный ИИ и человеком, и получает балл AIQ (0–100) и шарящийся диплом. Все детали продукта — в PRD.md.

## Стек

- **Framework:** Next.js 14, App Router, TypeScript (strict mode)
- **Styles:** Tailwind CSS, vanilla CSS variables для дизайн-токенов
- **Database:** Supabase (Postgres). Только хранение результатов. Без auth.
- **Hosting:** Vercel
- **Diploma:** библиотека `html-to-image` для генерации PNG на клиенте
- **Media players:** нативные HTML5 теги audio/video, без сторонних плееров
- **Media storage:** `/public/media/` (статические файлы, без CDN)

## Что делать в первый ход

1. Прочитай PRD.md полностью
2. Прочитай этот файл (CLAUDE.md) полностью
3. **Не пиши код.** Сначала предложи план:
   - Какие файлы создашь в первую очередь и в каком порядке
   - Какую структуру компонентов выберешь
   - Какие тестовые сценарии прогонишь по логике (без UI)
4. Жди моего согласования с планом, потом начинай.

## Структура проекта

```
app/
  layout.tsx                # Root layout, шрифты, глобальные стили
  page.tsx                  # Лендинг
  test/page.tsx             # Тест
  result/page.tsx           # Результат
  leaderboard/page.tsx      # Лидерборд
  methodology/page.tsx      # Методология
  api/
    submit-result/route.ts  # POST: сохранить результат, вернуть percentile
    leaderboard/route.ts    # GET: получить топ
  globals.css               # CSS-переменные, шрифты
components/
  TestRound.tsx             # Один раунд теста с таймером
  PairCardText.tsx          # Карточка пары для текста
  PairCardImage.tsx         # Карточка пары для изображения
  PairCardVideo.tsx         # Карточка пары для видео
  PairCardAudio.tsx         # Карточка пары для звука
  Diploma.tsx               # JSX диплома (рендерится в PNG через html-to-image)
  Leaderboard.tsx           # Таблица лидерборда
  ExpertBoard.tsx           # Топ-25 экспертов на лендинге
  Timer.tsx                 # Компонент таймера
  ProgressBar.tsx           # Прогресс-бар теста
lib/
  content.json              # 34 единицы с метаданными (заполняется отдельно)
  pairs.ts                  # buildAllPairs(), selectSessionPairs()
  scoring.ts                # computeAIQ(), computeBias(), computeModalityScores()
  titles.ts                 # getTitle(aiq, bias) — возвращает один из 12 титулов
  percentile.ts             # computePercentile()
  supabase.ts               # Клиент Supabase
  types.ts                  # Все TypeScript типы
public/
  media/
    images/                 # Картинки (PNG/JPG)
    videos/                 # Видео (MP4)
    audio/                  # Аудио (MP3)
  fonts/                    # Шрифты, если решим хостить локально
```

## TypeScript типы

В `lib/types.ts` опиши минимум эти типы:

```typescript
export type Modality = 'text' | 'image' | 'video' | 'audio';

export type ContentType =
  | 'marketplace' | 'bank' | 'ai-note'           // text
  | 'painting' | 'landscape'                      // image
  | 'cat-video' | 'ad-video'                      // video
  | 'phone-call-a' | 'phone-call-b' | 'song';     // audio

export type Source = 'ai' | 'human';

export type BiasProfile = 'paranoid' | 'trusting' | 'balanced';

export interface ContentItem {
  id: string;
  type: ContentType;
  modality: Modality;
  source: Source;
  content?: string;   // только для текстовых
  url?: string;       // только для медиа
}

export interface Pair {
  id: string;
  type: ContentType;
  modality: Modality;
  items: [ContentItem, ContentItem];
}

export interface RoundResult {
  pair: Pair;
  userLabels: [Source | null, Source | null];   // null = не размечено (таймаут)
}

export interface SessionResult {
  rounds: RoundResult[];
  aiq: number;
  modalityScores: Record<Modality, number>;
  biasProfile: BiasProfile;
  percentile?: number;
}
```

## Ключевые функции

### `lib/pairs.ts`

```typescript
export function buildAllPairs(items: ContentItem[]): Pair[]
// Группирует items по type. Для каждой группы генерирует все возможные пары C(n,2).
// Возвращает массив всех пар (для текущего банка — 47 пар).
// Каждая пара получает id вида "{type}-{idA}-{idB}".

export function selectSessionPairs(allPairs: Pair[]): Pair[]
// Возвращает 8 пар для одной сессии:
//   - 2 для модальности text, желательно из разных types
//   - 2 для image: одна painting + одна landscape
//   - 2 для video: одна cat-video + одна ad-video
//   - 2 для audio, желательно из разных types
// Никакая пара не повторяется в одной сессии.
// Если в группе только 1 пара (как ad-video) — берём её.
```

### `lib/scoring.ts`

```typescript
export function computeAIQ(rounds: RoundResult[]): number
// Сумма correct по всем 16 решениям, делённая на 16, умноженная на 100, округлённая.
// null в userLabel считается неправильным.

export function computeModalityScores(rounds: RoundResult[]): Record<Modality, number>
// Для каждой из 4 модальностей: correct в этой модальности / 4 × 100.

export function computeBiasProfile(rounds: RoundResult[]): BiasProfile
// falsePositive = размечено 'ai', truth 'human'
// falseNegative = размечено 'human', truth 'ai'
// delta = falsePositive - falseNegative
// delta >= 2 → 'paranoid', delta <= -2 → 'trusting', else 'balanced'
```

### `lib/titles.ts`

```typescript
export function getTitle(aiq: number, bias: BiasProfile): string
// Матрица 4 диапазона × 3 профиля. Тексты-заглушки из PRD.md.
// Финальные тексты вставит копирайтер позже.
```

### API: `app/api/submit-result/route.ts`

```
POST /api/submit-result
Body: {
  aiq, modalityText, modalityImage, modalityVideo, modalityAudio,
  biasProfile, displayName?, showInLeaderboard
}
Returns: { resultId, percentile }
```

Перед сохранением считает процентиль:
```sql
SELECT COUNT(*)::float / (SELECT COUNT(*) FROM results) * 100
FROM results WHERE aiq < $userAiq;
```

### API: `app/api/leaderboard/route.ts`

```
GET /api/leaderboard?filter=experts|all
Returns: { results: [...] }
```

Возвращает топ-100 результатов с `show_in_leaderboard=true`, сортировка по AIQ убыванию. Если `filter=experts` — только записи с `is_expert=true`. Кэш на 60 секунд.

## Тестовые проверки

**Прежде чем считать логику готовой**, прогони эти сценарии. Если есть Jest или Vitest — настрой их и сделай юнит-тесты. Если нет — прогон через консольный скрипт `lib/test-logic.ts` тоже годится.

```typescript
// 1. buildAllPairs
const items = loadContentJson();
const pairs = buildAllPairs(items);
assert(pairs.length === 47, `Expected 47 pairs, got ${pairs.length}`);
// Каждый тип:
const counts = groupByType(pairs);
assert(counts.marketplace === 3);
assert(counts.painting === 15);
assert(counts['ad-video'] === 1);
// ... и так далее

// 2. selectSessionPairs — стресс-тест на 100 сессий
for (let i = 0; i < 100; i++) {
  const session = selectSessionPairs(pairs);
  assert(session.length === 8, 'Always 8 pairs');
  assert(new Set(session.map(p => p.id)).size === 8, 'No duplicates');
  const byModality = groupBy(session, 'modality');
  assert(byModality.text.length === 2);
  assert(byModality.image.length === 2);
  assert(byModality.video.length === 2);
  assert(byModality.audio.length === 2);
}

// 3. computeAIQ
const allCorrect = mockRounds(allCorrectResponses);
assert(computeAIQ(allCorrect) === 100);
const allWrong = mockRounds(allWrongResponses);
assert(computeAIQ(allWrong) === 0);
const twelveCorrect = mockRounds(12, 4);  // 12 correct, 4 wrong
assert(computeAIQ(twelveCorrect) === 75);

// 4. computeBiasProfile
assert(computeBiasProfile(mockBias({fp: 4, fn: 0})) === 'paranoid');
assert(computeBiasProfile(mockBias({fp: 0, fn: 4})) === 'trusting');
assert(computeBiasProfile(mockBias({fp: 2, fn: 2})) === 'balanced');
```

## Дизайн-токены

В `app/globals.css`:

```css
:root {
  --color-primary: #1F3A60;
  --color-accent: #E63946;
  --color-bg: #FAFAFA;
  --color-surface: #FFFFFF;
  --color-text: #1A1A1A;
  --color-muted: #6B6B6B;
  --color-border: #E5E5E5;
  --color-success: #2A9D8F;
  --color-danger: #E63946;

  --font-display: 'Manrope', system-ui, sans-serif;
  --font-body: 'Manrope', system-ui, sans-serif;

  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 20px;

  --shadow-card: 0 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-elevated: 0 8px 24px rgba(0, 0, 0, 0.10);
}
```

Шрифт **Manrope** — кириллица хорошо читается, вес 400/600/800. Подключи через Google Fonts в `app/layout.tsx`.

## Конвенции

- **TypeScript строгий**, никакого `any`. Если тип неясен — спроси.
- **Все компоненты — функциональные** с типизированными props.
- **Server Components по умолчанию.** Client Components (`'use client'`) только где нужно: тестовый интерфейс, таймер, диплом, любые формы.
- **Все строки UI — на русском.** Никаких i18n библиотек.
- **Tailwind utility-классы**, используй CSS-переменные через `[var(--color-primary)]` или через `tailwind.config.ts` extend.
- **Если повторяешь паттерн больше двух раз — извлекай в компонент.**
- **Не используй `framer-motion` или другие тяжёлые анимационные библиотеки** без явного запроса. Достаточно CSS transitions.

## Чего НЕ делай

- ❌ Не добавляй authentication (NextAuth, Clerk, Supabase Auth — ничего). Анонимные сессии.
- ❌ Не сохраняй прогресс теста в localStorage — это намеренно одноразовое прохождение.
- ❌ Не загружай все медиа на лендинге. Подгружай контент только когда раунд активен.
- ❌ Не используй `any` в TypeScript.
- ❌ Не добавляй фичу, которой нет в PRD.md. Сначала спроси меня.
- ❌ Не оптимизируй преждевременно. Нагрузка ожидается небольшая (2-5К прохождений в месяц).
- ❌ Не пытайся защищать медиа от скачивания сложными схемами. Базовый HTML5 — достаточно.
- ❌ Не используй WebSocket, real-time подписки Supabase, или что-то реал-таймовое. Перезагрузка страницы для обновления лидерборда — норма.
- ❌ Не делай PWA, service workers, оффлайн-режим.

## Supabase подключение

После создания проекта Supabase:

1. В UI Supabase создай таблицу `results` через SQL, схема в PRD.md
2. Включи RLS на таблице
3. Создай две policies:
   - INSERT для anon: `true`
   - SELECT для anon: `show_in_leaderboard = true`
4. В `.env.local` положи:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
5. В `lib/supabase.ts`:
   ```typescript
   import { createClient } from '@supabase/supabase-js';
   export const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
   );
   ```

## Деплой

1. Сделай Git-репозиторий на GitHub
2. Подключи к Vercel — Vercel сам определит Next.js
3. В настройках Vercel добавь те же env переменные
4. Авто-деплой на push в main

## Порядок реализации (рекомендуемый)

Я предлагаю строить так, но дай свой вариант если видишь лучше:

1. **Базовая инфраструктура.** Next.js проект, Tailwind, типы в lib/types.ts, пустые страницы-заглушки на каждый роут.
2. **Логика теста без UI.** Реализовать lib/pairs.ts, lib/scoring.ts, lib/titles.ts. Прогнать тесты из «Тестовые проверки» — все должны проходить.
3. **content.json.** Сначала с заглушками (фиктивные строки и пути), потом я заменю на реальный контент.
4. **Тестовый интерфейс.** Компоненты PairCard*, TestRound, Timer. Минимальный UI без полировки.
5. **Сохранение результатов.** Supabase, API роуты, экран результата.
6. **Диплом.** Компонент Diploma, html-to-image, скачивание PNG.
7. **Лидерборд.** Страница лидерборда, ExpertBoard для лендинга.
8. **Методология.** Простая статика.
9. **Визуальная полировка.** Применить дизайн-токены, отступы, типографику.
10. **Финальные тексты.** Заменить заглушки на копи от копирайтера.

После каждого шага коммить в Git. Если что-то ломается — откатываемся к предыдущему коммиту.

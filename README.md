# AIQ

Виральный одностраничный квиз: пользователь различает контент, созданный ИИ и человеком, и получает балл AIQ от 0 до 100 в виде шарящегося диплома.

## Стек

- Next.js 14 (App Router), TypeScript strict
- Tailwind CSS
- Supabase (Postgres) — хранение результатов
- `html-to-image` — генерация PNG-диплома на клиенте
- Vitest — юнит-тесты бизнес-логики

## Запуск локально

```bash
npm install
cp .env.local.example .env.local   # подставь свои значения
npm run dev
```

Открой http://localhost:3000.

## Переменные окружения

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` — **без** префикса `NEXT_PUBLIC_`. Используется только в server-side роутах (API + Server Components), минует RLS. Никогда не должен попасть в клиентский бандл.

## Тесты

```bash
npm test
```

77 юнит-тестов покрывают бизнес-логику в `lib/`:
- `pairs.ts` — комбинаторика пар и отбор сессии
- `scoring.ts` — AIQ, модальные субскоры, профиль смещения
- `titles.ts` — матрица титулов 4×3
- `percentile.ts` — расчёт процентиля

## Документация

- [PRD.md](./PRD.md) — продуктовое описание
- [CLAUDE.md](./CLAUDE.md) — техническое ТЗ и конвенции

## Основные маршруты

- `/` — лендинг
- `/test` — тест (8 раундов, force-dynamic)
- `/result` — экран результата с дипломом и публикацией
- `/result/[id]` — публичный shared-результат
- `/leaderboard` — топ-100 (ISR, revalidate 60s)
- `/methodology` — описание методологии
- `/api/submit-result` — POST: сохранение результата
- `/api/leaderboard` — GET: топ-N результатов

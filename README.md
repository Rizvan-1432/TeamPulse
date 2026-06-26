# TeamPulse

> Kanban-доска с real-time обновлениями для команд.

**Автор:** Бакаев Ризван  
**Статус:** MVP+ — kanban, drag-and-drop, real-time, роли, activity log, CI

## Возможности

- Канбан-доска с колонками To Do / In Progress / Done
- Drag-and-drop карточек, приоритеты LOW / MEDIUM / HIGH
- Дедлайны на карточках, поиск и фильтр по приоритету
- Модальное окно редактирования карточки (вместо inline «Изм.»)
- Real-time синхронизация через SSE (Upstash Redis на production)
- Роли: владелец, редактор, наблюдатель
- История действий на доске
- Приглашение участников по email

## Стек

- **Frontend:** Next.js 16, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes, NextAuth.js
- **Real-time:** SSE + Upstash Redis (in-memory fallback локально)
- **DnD:** @dnd-kit
- **БД:** PostgreSQL, Prisma ORM
- **CI:** GitHub Actions — lint, build, Playwright E2E

## Быстрый старт

### 1. Установите зависимости

```bash
npm install
```

### 2. Настройте базу данных (локально)

```bash
cp .env.example .env
openssl rand -base64 32   # для AUTH_SECRET
```

Локально достаточно `DATABASE_URL` на Postgres. Миграции:

```bash
npx prisma migrate deploy
```

### Production: Neon (рекомендуется для Vercel)

Автоматическая настройка:

```bash
# 1. API-ключ: https://console.neon.tech/app/settings/api-keys
export NEON_API_KEY="napi_..."

# 2. Создать проект и сгенерировать .env.production.local
npm run db:neon

# 3. Применить миграции на Neon
npm run db:deploy
```

В Vercel добавьте из `.env.production.local`:
- `DATABASE_URL` — pooled (`-pooler` в hostname)
- `DIRECT_URL` — direct (без `-pooler`, для миграций)
- `AUTH_SECRET`, `NEXTAUTH_URL`

`vercel.json` уже запускает `prisma migrate deploy` при каждом деплое.

### Production: Supabase (альтернатива)

В `.env.example` — шаблоны `DATABASE_URL` (pooler, порт 6543) и `DIRECT_URL` (порт 5432).  
Приложение использует `@prisma/adapter-pg`; Neon переключается на `@prisma/adapter-neon` автоматически.

Опционально для real-time на Vercel: `UPSTASH_REDIS_REST_URL` и `UPSTASH_REDIS_REST_TOKEN` из [Upstash](https://upstash.com).

### 3. Запуск

```bash
npm run dev
```

- Landing: http://localhost:3000
- Login: http://localhost:3000/login
- Dashboard: http://localhost:3000/dashboard

### 4. Тесты

```bash
npm run lint
npm run build
npm run test:e2e   # Playwright (нужна БД и build)
```

## Структура

```
src/
  app/           # страницы и API routes
  components/    # UI компоненты
  lib/           # prisma, permissions, activity, realtime
  auth.ts        # NextAuth config
prisma/
  schema.prisma  # User, Board, Column, Card, Activity
e2e/             # Playwright E2E
```

## План

См. [PROJECT.md](./PROJECT.md)

## Репозиторий

[github.com/Rizvan-1432/TeamPulse](https://github.com/Rizvan-1432/TeamPulse)

**Live:** https://teampulse-rust-three.vercel.app

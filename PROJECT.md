# TeamPulse — мини-SaaS для команд

> Kanban-доска с real-time обновлениями: задачи, статусы, drag-and-drop, несколько пользователей.

**Автор:** Бакаев Ризван  
**Статус:** Неделя 4 — полировка  
**Цель:** Fullstack pet-проект с вау-эффектом для портфолио (hh.ru)

---

## Неделя 1 — прогресс

- [x] Next.js + Tailwind + shadcn/ui
- [x] Prisma schema (User, Board, Column, Card)
- [x] Auth (регистрация / вход)
- [x] Landing page
- [x] PostgreSQL + миграции (локально)
- [x] Подключить Neon/Supabase для production (конфиг + скрипты)
- [x] GitHub + Vercel деплой

---

## Идея продукта

**TeamPulse** — упрощённый Trello для небольших команд:
- канбан-доска: `To Do` → `In Progress` → `Done`
- drag-and-drop карточек между колонками
- изменения видны всем участникам **в реальном времени**
- регистрация, вход, личные доски
- приглашение участников на доску (роли: редактор / наблюдатель)
- переименование и удаление досок
- модалка редактирования карточек, дедлайны, фильтр по приоритету, поиск
- история действий (activity log)
- тёмная тема, адаптив под мобильный

---

## Стек

| Слой | Технологии |
|------|------------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS, shadcn/ui |
| Drag-and-drop | @dnd-kit/core |
| Backend | Next.js API Routes, NextAuth.js |
| БД | PostgreSQL, Prisma 7 |
| Real-time | SSE + Upstash Redis (fallback: in-memory) |
| CI | GitHub Actions (lint, build, Playwright E2E) |
| Деплой | Vercel (планируется) |

---

## План по неделям

### Неделя 2 — Доска
- [x] API CRUD для boards/cards
- [x] UI канбана
- [x] Dashboard со списком досок

### Неделя 3 — Real-time + DnD
- [x] @dnd-kit drag-and-drop
- [x] Real-time синхронизация (SSE)

### Неделя 4 — Полировка + деплой
- [x] Мобильная вёрстка
- [x] Переименование / удаление доски
- [x] Приглашение участников (BoardMember)
- [x] Роли viewer / editor
- [x] Модалка карточки, дедлайны, фильтр, поиск
- [x] Activity log
- [x] CI (lint + build + E2E)
- [x] Redis / Upstash для SSE на Vercel
- [x] Деплой Vercel
- [ ] README + скриншоты для hh.ru

---

## Репозиторий

- GitHub: https://github.com/Rizvan-1432/TeamPulse
- Live: https://teampulse-rust-three.vercel.app

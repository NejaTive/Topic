# Topic

Рейтинги по темам (топикам) с шарингом. Монорепо: `apps/web` (Vue 3) + `apps/api` (Nest).

## Требования

- **Node.js** 20+ (см. `.nvmrc`)
- **pnpm** 9.14+ (`corepack enable` или установка с [pnpm.io](https://pnpm.io))
- **Docker** — для Postgres и MinIO *(после Scaffold: BAC-5)*

## Быстрый старт

```bash
pnpm install
pnpm infra:up          # после BAC-5: Postgres + MinIO
pnpm --filter api dev  # после BAC-4: API на :3001
pnpm --filter web dev  # после FRO-1: SPA на :5173
```

Команды со 2-й по 4-ю заработают после соответствующих карточек Scaffold.

## Скрипты (корень)

| Команда | Назначение |
|---------|------------|
| `pnpm install` | Установить зависимости workspace |
| `pnpm dev` | Параллельный `dev` в `apps/*` |
| `pnpm build` | Сборка всех пакетов |
| `pnpm typecheck` | Typecheck всех пакетов |

## Структура

```text
apps/web/      — Vue 3 SPA
apps/api/      — Nest REST API
packages/*     — shared-пакеты (по необходимости)
docs/          — продукт, стек, решения
```

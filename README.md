# Topic

Рейтинги по темам (топикам) с шарингом. Монорепо: `apps/web` (Vue 3) + `apps/api` (Nest).

## Требования

- **Node.js** 20+ (см. `.nvmrc`)
- **pnpm** 9.14+ (`corepack enable` или установка с [pnpm.io](https://pnpm.io))
- **Docker** — для Postgres и MinIO (`pnpm infra:up`)

## Быстрый старт

```bash
pnpm install
pnpm infra:up          # Postgres + MinIO
pnpm --filter api dev  # после BAC-4: API на :3001
pnpm --filter web dev  # после FRO-1: SPA на :5173
```

Команды `api`/`web` заработают после соответствующих карточек Scaffold.

## Скрипты (корень)

| Команда | Назначение |
|---------|------------|
| `pnpm install` | Установить зависимости workspace |
| `pnpm dev` | Параллельный `dev` в `apps/*` |
| `pnpm build` | Сборка всех пакетов |
| `pnpm typecheck` | Typecheck всех пакетов |
| `pnpm infra:up` | Поднять Postgres + MinIO (`--wait` для них, затем `minio-init`) |
| `pnpm infra:down` | Остановить контейнеры |
| `pnpm infra:reset` | Остановить и удалить volumes |

## Инфраструктура

Локальный стек: Postgres 17 и MinIO (S3-совместимое хранилище обложек). Значения по умолчанию зашиты в `compose.yaml` (`${VAR:-default}`) — стек поднимается без `.env`. Переменные задокументированы в `.env.example`.

| Сервис | Порт (localhost) | Креды (dev-only) |
|--------|------------------|------------------|
| Postgres | `5432` | user/password/db: `topic` / `topic` / `topic` |
| MinIO API | `9000` | root: `minioadmin` / `minioadmin` |
| MinIO Console | [http://127.0.0.1:9001](http://127.0.0.1:9001) | те же root-креды |
| Бакет | — | `topic-covers` (создаёт `minio-init`) |

```bash
pnpm infra:up
docker compose ps
docker compose exec postgres psql -U topic -d topic -c "select 1"
pnpm infra:down    # остановить
pnpm infra:reset   # остановить и сбросить данные
```

Бакеты и порты биндятся только на `127.0.0.1`. Анонимный доступ к бакету не настраивается (политика — в эпике Topics).

Образы: `postgres:17-alpine`, `coollabsio/minio` и `pgsty/mc` (community-сборки MinIO CE — официальные `minio/minio` / `minio/mc` с осени 2026 не публикуются анонимно).

## Структура

```text
apps/web/      — Vue 3 SPA
apps/api/      — Nest REST API
packages/*     — shared-пакеты (по необходимости)
docs/          — продукт, стек, решения
```

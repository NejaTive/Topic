# История выполненных задач (YouGile)

Текстовый лог **завершённых** работ по задачам с доски YouGile.  
Актуальный бэклог и статусы — **только в YouGile**, не дублируем здесь.

## Когда писать

- Пишет **агент-ревьюер** при успешном ревью, **до merge** PR:
  1. дописать запись сюда;
  2. commit на feature-ветку;
  3. merge PR в `develop`;
  4. перенести карточку в **Готово**.
- Не писать при переводе в «На проверке» и не писать исполнителю.

## Формат записи

```markdown
### ДД.ММ.ГГГГ — <краткое название задачи>

- **YouGile:** <id или ссылка на карточку, если есть>
- **Итог:** 1–3 предложения, что сделано
- **Репо:** ветка / PR / commit (по факту)
- **Длительность:** реализация ~Xm · ревью ~Ym · всего ~Zm
- **Заметки:** блокеры, отложенное, что проверить вручную (опционально)
```

**Длительность** — wall-clock агентов (минуты). **Реализация** / **ревью** — суммы всех циклов Review↔Doing по карточке; **всего** = реализация + ревью. Планировщик не входит. Старые записи без поля не дополняем.

---

## Записи

### 06.10.2026 — Подключить OpenAPI и экспорт спецификации

- **YouGile:** BAC-2
- **Итог:** `@nestjs/swagger`: Swagger UI `/api/docs`, JSON `/api/openapi.json` (title «Topic API», version из `apps/api/package.json`); Health DTO + `@ApiOkResponse`/`@ApiServiceUnavailableResponse`; общая `buildOpenApiDocument`/`setupOpenApi`; `openapi:export` без listen/БД; `openapi.json` в `.gitignore`; раздел «Контракт API» в README.
- **Репо:** `feat/BAC-2` / [PR #6](https://github.com/NejaTive/Topic/pull/6) / (merge в develop)
- **Длительность:** реализация ~3 мин · ревью ~5 мин · всего ~8 мин
- **Заметки:** комментарии в чат YouGile через MCP недоступны (чеклист ревью в карточке); FRO-5 (`gen:api`) и security/cookie-auth — out of scope.

### 06.10.2026 — Подключить Prisma и эндпоинт GET /api/health

- **YouGile:** BAC-3
- **Итог:** Prisma 7.10 + `@prisma/adapter-pg` + dotenv: пустая schema без моделей, `prisma.config.ts`, глобальные PrismaModule/Service (lazy connect, `$disconnect` на shutdown), скрипты `db:generate`/`db:migrate`/`db:studio`, `prebuild` → generate; `GET /api/health` → 200 `{status:ok,db:up}` / 503 `{status:error,db:down}`; `DATABASE_URL` обязателен, в `.env.example` как дефолты compose BAC-5 (`topic`/`topic`).
- **Репо:** `feat/BAC-3` / [PR #4](https://github.com/NejaTive/Topic/pull/4) / `53dedc0`
- **Длительность:** реализация ~5 мин · ревью ~5 мин · всего ~10 мин
- **Заметки:** пароль в AC-тексте (`topic_dev_password`) устарел — взяты дефолты compose BAC-5; моделей нет (по scope); комментарии в чат YouGile через MCP недоступны, чеклист ревью в карточке.

### 06.10.2026 — Поднять Postgres и MinIO через docker compose

- **YouGile:** BAC-5
- **Итог:** Корневой `compose.yaml` (Postgres 17 + MinIO + one-shot `minio-init` → бакет `topic-covers`), порты на `127.0.0.1`, дефолты `${VAR:-default}`; `.env.example`; скрипты `infra:up`/`down`/`reset`; раздел «Инфраструктура» в README. Образы `coollabsio/minio` + `pgsty/mc` вместо официальных `minio/*` (анонимный pull недоступен с осени 2026) — зафиксировано в compose/README.
- **Репо:** `feat/BAC-5` / [PR #3](https://github.com/NejaTive/Topic/pull/3) / `484a634`
- **Заметки:** api/Dockerfile/S3/политика бакета — out of scope; `.env` не создавался; комментарии в чат YouGile через MCP недоступны, чеклист ревью в карточке.

### 05.10.2026 — Создать Nest-приложение apps/api

- **YouGile:** BAC-4
- **Итог:** Workspace-пакет `apps/api` (Nest 12): скрипты `dev`/`build`/`start`/`typecheck`, `main.ts` (PORT 3001, prefix `api`, ValidationPipe, shutdown hooks), глобальный ConfigModule с валидацией `PORT`/`NODE_ENV` через class-validator, `.env.example`, пустой `AppModule` без hello-world и без eslint/jest/prettier.
- **Репо:** `feat/BAC-4` / [PR #2](https://github.com/NejaTive/Topic/pull/2) / `166c141`
- **Заметки:** Prisma/health — BAC-3; OpenAPI — BAC-2; ESLint — BAC-6; комментарии в чат YouGile через MCP недоступны, чеклист ревью в карточке.

### 05.10.2026 — Инициализировать pnpm-монорепо

- **YouGile:** BAC-1
- **Итог:** Корневой pnpm-монорепо (`apps/*`, `packages/*`), `packageManager` pnpm@9.14.2, Node ≥20, `tsconfig.base.json` (strict, ES2022), editorconfig/gitattributes, корневые скрипты `dev`/`build`/`typecheck`, README. Приложения не создавались (по AC).
- **Репо:** `feat/BAC-1` / [PR #1](https://github.com/NejaTive/Topic/pull/1) / `8a34e73`
- **Заметки:** стек apps ещё нет — проверка скриптов на пустом workspace; комментарии в чат YouGile через MCP недоступны, чеклист ревью записан в карточку.


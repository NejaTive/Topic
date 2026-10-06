# apps/api

NestJS REST API (Prisma + Postgres).

**Auth-модели (Prisma):** `User` (`email`, `nick`, `passwordHash`) и `Session` (`tokenHash`, `expiresAt`, FK `userId` → User с `onDelete: Cascade`, индекс по `userId`). Ник нормализуется в **lowercase** перед записью — так unique на `nick` даёт case-insensitive уникальность.

**Topic / Item:** `Topic` (`shareId` unique, `ownerId` → User Cascade, `privacy`: private|unlisted|public, default unlisted) и `Item` (`topicId` → Topic Cascade, `coverKey` nullable, `placement`: unranked|ranked, `rankPosition` Int nullable). Индексы: `ownerId` на Topic; `(topicId, placement, rankPosition)` на Item. **placement** — корзина элемента (`unranked` = «ещё не оценены», `ranked` = в рейтинге). **rankPosition** — только для `ranked`: плотный порядок 1…N внутри топика; mid-list — `POST …/items/reorder`.

**Auth HTTP:** `POST /api/auth/register|login|logout`, `GET /api/auth/me`. Пароль — argon2; opaque cookie `topic_session` (httpOnly, SameSite=Lax, Path=/, Max-Age 30д); в БД только SHA-256 hash токена. Для защищённых эндпоинтов — `AuthGuard` + `@CurrentUser()`. После изменения контракта: корневой `pnpm gen:api` и коммит `apps/web/src/api/schema.d.ts`.

**Topics HTTP (владелец, cookie session):** `GET/POST /api/topics`, `GET/PATCH/DELETE /api/topics/:id`. Privacy default `unlisted`; `shareId` opaque unique, не меняется при PATCH privacy. Список: `id`, `title`, `privacy`, `updatedAt`, `previewCovers` (coverKey топ-3 ranked или `[]`).

**Share HTTP (публичный, без cookie):** `GET /api/t/:shareId` → `{ title, privacy, ownerNick, items }` — только `placement=ranked` по `rankPosition`; у item: `id`, `title`, `rankPosition`, `coverUrl` nullable. Inbox не отдаём. `privacy=private` → **403** (в т.ч. для владельца по этому маршруту); нет / удалён → **404**. OG / signed URL — out of scope.

**Items HTTP (владелец, cookie session):** под `/api/topics/:topicId/items`:
- `GET` — `{ inbox, ranked }` (секции по placement);
- `POST` — create → `unranked`;
- `POST /reorder` — тело `{ orderedItemIds: uuid[] }`: полная перестановка **всех** ranked id топика одной транзакцией → плотный `rankPosition` 1…N; ответ `{ inbox, ranked }`; невалидный набор id → **422**;
- `GET|PATCH|DELETE /:itemId`;
- `POST /:itemId/rank` — в конец ranked + плотный `rankPosition`;
- `POST /:itemId/unrank` — в inbox, сжатие рангов;
- `POST|PUT /:itemId/cover` — multipart поле `file` (≤ 5 МБ), magic-MIME (JPEG/PNG/WebP/GIF) → `sharp` webp → S3 ключ `covers/{uuid}.webp`; replace удаляет старый объект;
- `DELETE /:itemId/cover` — сброс `coverKey` + удаление объекта.

Чужой / неизвестный `topicId` → **404** (как Topics). Ответы item содержат **`coverUrl`** (не сырой ключ).

**Обложки / MinIO (dev):** прямой path-style URL MinIO — `coverUrl = {S3_PUBLIC_URL}/{S3_BUCKET}/{coverKey}` (например `http://127.0.0.1:9000/topic-covers/covers/….webp`). Proxy через API не используем. Риск «private URL только неугадываемый» — принят (stage-3). В `compose` бакет `topic-covers` с anonymous download, чтобы `coverUrl` открывался в браузере. Env: `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`, `S3_PUBLIC_URL` (см. `.env.example`).

**DELETE топика:** (1) owner-check → (2) собрать `coverKey` → (3) Cascade в БД → (4) best-effort удаление объектов из S3/MinIO.

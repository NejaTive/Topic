# apps/api

NestJS REST API (Prisma + Postgres).

**Auth-модели (Prisma):** `User` (`email`, `nick`, `passwordHash`) и `Session` (`tokenHash`, `expiresAt`, FK `userId` → User с `onDelete: Cascade`, индекс по `userId`). Ник нормализуется в **lowercase** перед записью — так unique на `nick` даёт case-insensitive уникальность.

**Topic / Item:** `Topic` (`shareId` unique, `ownerId` → User Cascade, `privacy`: private|unlisted|public, default unlisted) и `Item` (`topicId` → Topic Cascade, `coverKey` nullable, `placement`: unranked|ranked, `rankPosition` Int nullable). Индексы: `ownerId` на Topic; `(topicId, placement, rankPosition)` на Item. **placement** — корзина элемента (`unranked` = «ещё не оценены», `ranked` = в рейтинге). **rankPosition** — только для `ranked`: плотный порядок 1…N внутри топика (перестановки — одной транзакцией на уровне сервиса, не в этой схеме).

**Auth HTTP:** `POST /api/auth/register|login|logout`, `GET /api/auth/me`. Пароль — argon2; opaque cookie `topic_session` (httpOnly, SameSite=Lax, Path=/, Max-Age 30д); в БД только SHA-256 hash токена. Для защищённых эндпоинтов — `AuthGuard` + `@CurrentUser()`. После изменения контракта: корневой `pnpm gen:api` и коммит `apps/web/src/api/schema.d.ts`.

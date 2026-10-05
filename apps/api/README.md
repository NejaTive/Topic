# apps/api

NestJS REST API (Prisma + Postgres).

**Auth-модели (Prisma):** `User` (`email`, `nick`, `passwordHash`) и `Session` (`tokenHash`, `expiresAt`, FK `userId` → User с `onDelete: Cascade`, индекс по `userId`). Ник нормализуется в **lowercase** перед записью — так unique на `nick` даёт case-insensitive уникальность; HTTP/argon2 — в задачах Auth (BAC-8+).

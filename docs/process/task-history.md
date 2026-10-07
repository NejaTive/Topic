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
- **Заметки:** блокеры, отложенное, что проверить вручную (опционально)
- **Доработка после ревью:** нет | да (цикл N/3; кратко почему)
- **Длительность:** реализация ~Xm · ревью ~Ym · всего ~Zm
```

**Доработка после ревью** — был ли возврат «На проверке» → «В разработке» (FAIL ревью) перед финальным OK. Если циклов >1 — указать финальный `N/3`.

**Длительность** — wall-clock агентов (минуты). **Реализация** / **ревью** — суммы всех циклов Review↔Doing по карточке; **всего** = реализация + ревью. Планировщик не входит. Пропуски допускается закрывать **ретрооценкой** (пометка в Заметках), чтобы сводки не ломались.

---

## Записи

### 07.10.2026 — Ревью Auth — валидация login/register и правки UI

- **YouGile:** FRO-21
- **Итог:** Клиентская валидация login/register (`auth-validation.ts`) до запроса к API; русские сообщения class-validator в LoginDto/RegisterDto; accent-ссылки Войти/Регистрация; AppButton md `px-6` + `cursor-pointer`.
- **Репо:** `fix/FRO-21` / [PR #35](https://github.com/NejaTive/Topic/pull/35) / (merge в develop)
- **Заметки:** manual-close после ручного ревью владельцем; BAC DTO в том же коммите.
- **Доработка после ревью:** нет
- **Длительность:** ручное изменение

### 06.10.2026 — Сверстать S11 и S12 — ошибки доступа/404

- **YouGile:** FRO-20
- **Итог:** Общий `ErrorStateView` + GuestNav `ctaMode=error`: S11 «Нет доступа» / S12 «Не найдено»; Share 403→`/share/no-access`, 404→`/share/not-found`; catch-all неизвестных URL → S12; stubs FRO-19 удалены.
- **Репо:** `feat/FRO-20` / [PR #34](https://github.com/NejaTive/Topic/pull/34) / (merge в develop)
- **Заметки:** чеклист ревью в карточке YouGile; smoke: private→S11, missing→S12, `/foo-bar-xyz`→S12, guest «На главную»→`/`, `/dev/ui-kit` ок; `pnpm --filter web build`; toast/global boundary/Flow E и Figma subtitle vs AC — out of scope.
- **Доработка после ревью:** нет
- **Длительность:** реализация ~2 мин · ревью ~14 мин · всего ~16 мин

### 06.10.2026 — Сверстать S09 — share-view

- **YouGile:** FRO-19
- **Итог:** `/t/:shareId` без `requiresAuth`: GuestNav + `@ownerNick` + title + PrivacyChip + read-only RankRow (без handle/DnD); empty «Пока нечего показать»; `useShareQuery` → BAC-13; 403→`/share/no-access`, 404→`/share/not-found` (stubs); владелец на своём share остаётся на S09.
- **Репо:** `feat/FRO-19` / [PR #33](https://github.com/NejaTive/Topic/pull/33) / (merge в develop)
- **Заметки:** чеклист ревью в карточке YouGile; `pnpm --filter web build`; smoke: unlisted/public guest, empty copy, private→no-access, missing→not-found, owner logged-in без redirect S05/AppNav, GuestNav Войти→/login; hi-fi S11/S12, OG/S10/DnD/inbox, returnUrl on login — out of scope.
- **Доработка после ревью:** нет
- **Длительность:** реализация ~15 мин · ревью ~14 мин · всего ~29 мин

### 06.10.2026 — Собрать GuestNav (M+D)

- **YouGile:** FRO-18
- **Итог:** `GuestNav`: floating dock (M bottom / D top / auto), бренд Topic→`/`, Primary «Войти»→`/login`, ghost «Присоединиться»→`/`; `ctaMode=error` и props override для S11/S12; экспорт из `@/components/ui`, витрина `/dev/ui-kit`, README.
- **Репо:** `feat/FRO-18` / [PR #32](https://github.com/NejaTive/Topic/pull/32) / (merge в develop)
- **Заметки:** чеклист ревью в task-history (чат YouGile MCP недоступен); smoke ui-kit: клики Войти/Присоединиться/На главную, `pnpm --filter web build`; M — 2 CTA по decisions (не 1 CTA Figma); wire S09/S11/S12 — out of scope.
- **Доработка после ревью:** нет
- **Длительность:** реализация ~12 мин · ревью ~6 мин · всего ~18 мин

### 06.10.2026 — Реализовать публичный Share API

- **YouGile:** BAC-13
- **Итог:** `GET /api/t/:shareId` без AuthGuard: `{ title, privacy, ownerNick, items }` только ranked по `rankPosition` (id, title, rankPosition, coverUrl); private → 403 (в т.ч. владелец); нет топика → 404; OpenAPI + `schema.d.ts` + README.
- **Репо:** `feat/BAC-13` / [PR #31](https://github.com/NejaTive/Topic/pull/31) / (merge в develop)
- **Заметки:** чеклист ревью в карточке YouGile; smoke: unlisted/public 200 без cookie без inbox, private 403 (noauth+owner), missing 404, `pnpm gen:api` без drift; OG/S10/S13/signed URL — out of scope.
- **Доработка после ревью:** нет
- **Длительность:** реализация ~5 мин · ревью ~6 мин · всего ~11 мин

### 06.10.2026 — Сверстать S06 и S07 — элемент

- **YouGile:** FRO-14
- **Итог:** Экраны S06 (`/items/new`) и S07 (`/items/:itemId`) с `requiresAuth`: create + optional cover → S05; edit title/cover, meta «Добавлен» + placement, rank/unrank (BAC-11), Сохранить/Удалить; RankRow → S07; CoverUpload ошибки 5 МБ/тип; без consumedAt/DnD/Share.
- **Репо:** `feat/FRO-14` / [PR #30](https://github.com/NejaTive/Topic/pull/30) / (merge в develop)
- **Заметки:** чеклист ревью в карточке YouGile; `typecheck`/`build` web ок; smoke: guest `returnUrl`, S05→add→inbox→S07→rank→ranked, edit/save, unrank, delete→S05, cover >5МБ client + тип server error state; cover fail after create → redirect S07 (handoff).
- **Доработка после ревью:** нет
- **Длительность:** реализация ~4 мин · ревью ~5 мин · всего ~9 мин

### 06.10.2026 — Добавить DnD ранга на S05

- **YouGile:** FRO-13
- **Итог:** Нативный HTML5 DnD на S05: ranked reorder через handle (`shadow-float`), POST `/items/reorder` (BAC-12) с optimistic UI + rollback; inbox→ranked в конец (BAC-11), без mid-insert/S08/↑↓; `RankRow.dragEnabled`.
- **Репо:** `feat/FRO-13` / [PR #29](https://github.com/NejaTive/Topic/pull/29) / (merge в develop)
- **Заметки:** чеклист ревью в карточке YouGile; `typecheck`/`build` web ок; smoke: 5 ranked drag 1→3 + persist reload/API; inbox drop → конец; drag без handle не стартует; ошибка reorder → rollback + «Не удалось сохранить порядок»; без DnD-библиотек.
- **Доработка после ревью:** нет
- **Длительность:** реализация ~4 мин · ревью ~13 мин · всего ~17 мин

### 06.10.2026 — Сверстать S05 — редактор топика (без DnD)

- **YouGile:** FRO-12
- **Итог:** `/app/topics/:id` (S05) вместо stub: AppNav, back «← Мои топики», title, meta (PrivacyChip picker → PATCH; Unlisted M icon / D ghost copy `/t/:shareId`; Danger «Удалить топик» → DELETE → S03); inbox|ranked на RankRow (D 2 колонки); «В рейтинг» → POST rank end; CTA → stub S06; empty copy stage-1.
- **Репо:** `feat/FRO-12` / [PR #28](https://github.com/NejaTive/Topic/pull/28) / (merge в develop)
- **Заметки:** чеклист ревью в карточке YouGile; `typecheck`/`build` web ок; smoke: login→S05 M+D, privacy PATCH, Unlisted copy UI (clipboard в MCP-браузере без permission — не баг продукта), rank end, empty/inbox-only copy, add→stub, 404, delete→S03; DnD — FRO-13; полный S06 — FRO-14.
- **Доработка после ревью:** нет
- **Длительность:** реализация ~5 мин · ревью ~16 мин · всего ~21 мин

### 06.10.2026 — Сверстать S04 — создание топика

- **YouGile:** FRO-11
- **Итог:** `/app/topics/new` (S04) вместо stub: AppNav, title + MainChip (текст без presetKey), PrivacyChip selector (default unlisted — поле не шлётся, пока не трогали), `useCreateTopicMutation` → POST `/api/topics` → redirect `/app/topics/:id`; ошибки валидации API на поля; README.
- **Репо:** `feat/FRO-11` / [PR #27](https://github.com/NejaTive/Topic/pull/27) / (merge в develop)
- **Заметки:** чеклист ревью в карточке YouGile; `pnpm --filter web build`; smoke: guest `returnUrl`, chip «Фильмы», create→unlisted + S05 stub, privacy touched→private, empty title client, title>200 API field error; без категорий/S03.
- **Доработка после ревью:** нет
- **Длительность:** реализация ~2 мин · ревью ~5 мин · всего ~7 мин

### 06.10.2026 — Сверстать S03 — мои топики

- **YouGile:** FRO-17
- **Итог:** `/app/topics` (S03) вместо auth-stub: `GET /api/topics` через Vue Query, `AppNav` + `TopicRow`/privacy, empty «Создайте первый топик» + CTA, FAB(M)/header CTA(D) → S04 stub, tap → S05 stub; loading/error; logout чистит topics cache; README.
- **Репо:** `feat/FRO-17` / [PR #26](https://github.com/NejaTive/Topic/pull/26) / (merge в develop)
- **Заметки:** чеклист ревью в карточке YouGile; `pnpm --filter web build`; smoke login→list, empty, CTA/FAB→`/new`, tap→`:id`, guest `returnUrl`, `/app`→topics; без S04/S05 экранов и S13.
- **Доработка после ревью:** нет
- **Длительность:** реализация ~4 мин · ревью ~6 мин · всего ~10 мин

### 06.10.2026 — Собрать UI-Kit: Rank row, Cover upload, Main chip

- **YouGile:** FRO-16
- **Итог:** `RankRow` (cover thumb, title, rank badge top-3 accent, visual drag-handle, inbox «В рейтинг»; states default/hover/focus/dragging; max-w 358), `CoverUpload` (empty/hover/filled/error, file input, emit `file`, copy «до 5 МБ» + client check), `MainChip` (Фильмы/Сериалы/Книги/Игры → emit label); экспорт `@/components/ui`; витрина `/dev/ui-kit`; README; без DnD/↑↓/Privacy.
- **Репо:** `feat/FRO-16` / [PR #25](https://github.com/NejaTive/Topic/pull/25) / (merge в develop)
- **Заметки:** чеклист ревью в карточке YouGile; `typecheck`/`build`; smoke `/dev/ui-kit` (MainChip emit, Cover error/>5МБ, RankRow top-3/dragging/inbox); без DnD (FRO-13) и S04–S07 экранов.
- **Доработка после ревью:** нет
- **Длительность:** реализация ~2 мин · ревью ~4 мин · всего ~6 мин

### 06.10.2026 — Собрать UI-Kit: Nav, Topic row, Privacy chip

- **YouGile:** FRO-15
- **Итог:** `AppNav` (floating dock bottom M / top D / auto, soft-well active, «Мои топики» + профиль/logout placeholder), `TopicRow` (title/meta/privacy, optional covers, hover), `PrivacyChip` (private|unlisted|public + `compact`); экспорт `@/components/ui`; витрина `/dev/ui-kit`; без баннера «Топик изменился».
- **Репо:** `feat/FRO-15` / [PR #24](https://github.com/NejaTive/Topic/pull/24) / (merge в develop)
- **Заметки:** чеклист ревью в карточке YouGile; `typecheck`/`build`; smoke `/dev/ui-kit` (chips, TopicRow D/M, AppNav auto+inline); без Rank/Cover (FRO-16) и S03 (FRO-17).
- **Доработка после ревью:** нет
- **Длительность:** реализация ~2 мин · ревью ~5 мин · всего ~7 мин

### 06.10.2026 — Переупорядочить ranked одной транзакцией

- **YouGile:** BAC-12
- **Итог:** `POST /api/topics/:topicId/items/reorder` с `{ orderedItemIds: uuid[] }` — полная перестановка ranked → плотный `rankPosition` 1…N в одной `$transaction` (raw SQL `UPDATE … FROM VALUES`); чужой топик 404, невалидный набор 422; OpenAPI + `schema.d.ts`; README.
- **Репо:** `feat/BAC-12` / [PR #23](https://github.com/NejaTive/Topic/pull/23) / (merge в develop)
- **Заметки:** чеклист ревью в карточке YouGile; smoke: reverse mid-list + GET, dense 1…N, inbox unchanged, 401/404/422 (partial/dup/inbox/unknown), empty ranked `[]`; typecheck OK. POST без `@HttpCode(200)` даёт 201 (как rank/unrank). Без DnD/↑↓/S08.
- **Доработка после ревью:** нет
- **Длительность:** реализация ~6 мин · ревью ~4 мин · всего ~10 мин

### 06.10.2026 — Реализовать Items API и загрузку обложек

- **YouGile:** BAC-11
- **Итог:** Owner-only Items CRUD `/api/topics/:topicId/items` (inbox + ranked), create → unranked; rank/unrank с плотным `rankPosition`; cover multipart ≤5 МБ (magic-MIME → sharp webp → MinIO), replace/DELETE чистят объект; `coverUrl` path-style в README; DELETE топика чистит covers; OpenAPI + `schema.d.ts`; fix runtime `multer`.
- **Репо:** `feat/BAC-11` / [PR #22](https://github.com/NejaTive/Topic/pull/22) / (merge в develop)
- **Заметки:** чеклист ревью в карточке YouGile; smoke: multer start + Items routes, CRUD/rank/unrank, cover→MinIO, replace удаляет старый ключ, bad MIME 400 / >5MB 413, чужой topic 404, DELETE topic чистит S3; без mid-list reorder / signed URL / share.
- **Доработка после ревью:** да (цикл 2/3)
- **Длительность:** реализация ~8 мин · ревью ~11 мин · всего ~19 мин

### 06.10.2026 — Реализовать Topics API

- **YouGile:** BAC-10
- **Итог:** REST CRUD `/api/topics` с AuthGuard: list (previewCovers топ-3 ranked), create (privacy default unlisted, opaque unique shareId), get/patch/delete только owner; PATCH title/privacy без смены shareId; DELETE Cascade items + порядок cover cleanup для BAC-11 (no-op); OpenAPI + `schema.d.ts`.
- **Репо:** `feat/BAC-10` / [PR #21](https://github.com/NejaTive/Topic/pull/21) / (merge в develop)
- **Заметки:** чеклист ревью в карточке YouGile; smoke cookie CRUD + 401/404/validation; cascade Item→Topic; previewCovers; без Items endpoints / public share / Follow.
- **Доработка после ревью:** нет
- **Длительность:** реализация ~3 мин · ревью ~5 мин · всего ~8 мин

### 06.10.2026 — Добавить модели Topic и Item в Prisma

- **YouGile:** BAC-9
- **Итог:** Prisma-модели `Topic` (`shareId` unique, `ownerId`→User Cascade, `privacy` private|unlisted|public default unlisted) и `Item` (`topicId`→Topic Cascade, `coverKey` nullable, `placement` unranked|ranked, `rankPosition`); индексы `ownerId` и `(topicId, placement, rankPosition)`; миграция `add_topic_item`; README про placement и плотный rankPosition.
- **Репо:** `feat/BAC-9` / [PR #20](https://github.com/NejaTive/Topic/pull/20) / (merge в develop)
- **Заметки:** чеклист ревью в карточке YouGile; `db:migrate` sync; `pnpm --filter api build`; таблицы/индексы/enums/FK CASCADE в Postgres; smoke cascade User→Topic→Item; без HTTP/MinIO/Follow/seed.
- **Доработка после ревью:** нет
- **Длительность:** реализация ~3 мин · ревью ~5 мин · всего ~8 мин

### 06.10.2026 — Сверстать S02 — регистрация

- **YouGile:** FRO-10
- **Итог:** Экран `/register` по Figma Auth S02 (карточка M 358 / D 440): «← Topic», Email/Ник/Пароль, ссылка «Войти» → `/login`, Primary «Зарегистрироваться»; submit → register → `/app/topics`; error UI 409 nick/email и validation 400/422 через `mapRegisterValidationFields`; `guestOnly` в router.
- **Репо:** `feat/FRO-10` / [PR #19](https://github.com/NejaTive/Topic/pull/19) / (merge в develop)
- **Заметки:** чеклист ревью в карточке YouGile; `typecheck`/`build`; API+Vite proxy smoke register/me + 409 nick/email + 400 nick/password; guestOnly/`← Topic`/`Войти` по исходникам; browser MCP недоступен — M+D по исходникам (как S01); без captcha/social/S03.
- **Доработка после ревью:** нет
- **Длительность:** реализация ~4 мин · ревью ~5 мин · всего ~9 мин

### 06.10.2026 — Сверстать S01 — вход

- **YouGile:** FRO-9
- **Итог:** Экран `/login` по Figma Auth S01 (карточка M 358 / D 440): «← Topic», Email/Пароль, ссылка «Регистрация» → `/register`, Primary «Войти»; submit → login → `/app/topics` или безопасный `returnUrl`; error UI 401 (email invalid + сообщение на пароле) и validation 400/422 по полям; `AppInput` prop `invalid`.
- **Репо:** `feat/FRO-9` / [PR #18](https://github.com/NejaTive/Topic/pull/18) / (merge в develop)
- **Заметки:** чеклист ревью в карточке YouGile; `typecheck`/`build`; API+Vite proxy smoke register/login/me + 401/400; guestOnly/`returnUrl` по исходникам; browser MCP / Figma channel недоступны — M+D по исходникам; без «Забыли пароль?»/OAuth/S03.
- **Доработка после ревью:** нет
- **Длительность:** реализация ~4 мин · ревью ~13 мин · всего ~17 мин

### 06.10.2026 — Сверстать S00 — лендинг

- **YouGile:** FRO-8
- **Итог:** Лендинг S00 на `/` (M+D copy/layout): бренд Topic, value, CTA «Войти»/`AppButton` primary → `/login`, «Регистрация» secondary → `/register`; `guestOnly` → authed redirect `/app/topics`; TEMP health smoke с `/` убран.
- **Репо:** `feat/FRO-8` / [PR #17](https://github.com/NejaTive/Topic/pull/17) / (merge в develop)
- **Заметки:** чеклист ревью в карточке YouGile; `typecheck`/`build`; HTTP `/` + login/register; auth register/me cookie; UI browser MCP / Figma channel недоступны — M+D и guards по исходникам; без app-nav.
- **Доработка после ревью:** нет
- **Длительность:** реализация ~3 мин · ревью ~6 мин · всего ~9 мин

### 06.10.2026 — Подключить auth на фронте (клиент, store, guards)

- **YouGile:** FRO-7
- **Итог:** Typed auth helpers (`register`/`login`/`logout`/`me`) через `openapi-fetch` + `credentials: include`; `useMeQuery` → Pinia `unknown`→`guest`/`authed`; mutations; router `guestOnly`/`requiresAuth` + `returnUrl`; stub `/app/topics` («Мои топики», logout); базовый 401→guest.
- **Репо:** `feat/FRO-7` / [PR #16](https://github.com/NejaTive/Topic/pull/16) / (merge в develop)
- **Заметки:** чеклист ревью в карточке YouGile; `typecheck`; smoke register/login/me/logout через Vite proxy; UI browser MCP недоступен — guards/stub по исходникам; schema после BAC-8 без diff.
- **Доработка после ревью:** нет
- **Длительность:** реализация ~4 мин · ревью ~8 мин · всего ~12 мин

### 06.10.2026 — Собрать UI-Kit: Button и Input

- **YouGile:** FRO-6
- **Итог:** `AppButton` (primary/secondary/ghost/danger-ghost; md 44 / sm 32; hover/focus/disabled; `loading` блокирует клик) и `AppInput` (label, `v-model`, text/password/email, error снизу); стили на Tailwind-токенах + `outline-focus-ring`; экспорт `@/components/ui`; витрина `/dev/ui-kit`; кратко в README.
- **Репо:** `feat/FRO-6` / [PR #15](https://github.com/NejaTive/Topic/pull/15) / (merge в develop)
- **Заметки:** чеклист ревью в карточке YouGile; `typecheck`/`build`; HTTP `/dev/ui-kit` 200 + Vite-модули; CSS с `--color-focus-ring`/`--size-control-*`; browser MCP недоступен; Textarea/Chip/Storybook — out of scope.
- **Доработка после ревью:** нет
- **Длительность:** реализация ~3 мин · ревью ~4 мин · всего ~7 мин

### 06.10.2026 — Реализовать Auth API и cookie-сессию

- **YouGile:** BAC-8
- **Итог:** REST Auth (`register`/`login`/`logout`/`me`): argon2, opaque cookie `topic_session` (httpOnly, SameSite=Lax, Path=/, Max-Age 30д), в БД SHA-256 hash токена; DTO + class-validator; 409 email/nick; AuthGuard + `@CurrentUser()`; OpenAPI cookie auth + `gen:api` → `schema.d.ts`.
- **Репо:** `feat/BAC-8` / [PR #14](https://github.com/NejaTive/Topic/pull/14) / (merge в develop)
- **Заметки:** чеклист ревью в карточке YouGile; typecheck + gen:api без diff; smoke curl/IWR; lint script в api нет.
- **Доработка после ревью:** нет
- **Длительность:** реализация ~6 мин · ревью ~7 мин · всего ~13 мин

### 06.10.2026 — Добавить модели User и Session в Prisma

- **YouGile:** BAC-7
- **Итог:** Prisma-модели `User` (uuid, email/nick unique, passwordHash, createdAt) и `Session` (tokenHash, expiresAt, FK userId Cascade + индекс); nick в lowercase для case-insensitive unique; миграция `add_user_session`; seed не добавлялся; кратко в `apps/api/README.md`.
- **Репо:** `feat/BAC-7` / [PR #13](https://github.com/NejaTive/Topic/pull/13) / (merge в develop)
- **Заметки:** чеклист ревью в карточке YouGile; clean migrate после DROP таблиц; `build` + `\d User/Session` (Cascade, unique nick/email).
- **Доработка после ревью:** нет
- **Длительность:** реализация ~3 мин · ревью ~5 мин · всего ~8 мин

### 06.10.2026 — Сгенерировать типизированный API-клиент и проверить связку web ↔ api

- **YouGile:** FRO-5
- **Итог:** `openapi-typescript` + `openapi-fetch` в `apps/web`; корневой `pnpm gen:api` (export → `schema.d.ts`); закоммичен `apps/web/src/api/schema.d.ts` с баннером generated; `apiClient` (`credentials: include`, `baseUrl: ''`); `useHealthQuery` + TEMP-статус на `/`; README правило «изменили API → gen:api → коммит schema».
- **Репо:** `feat/FRO-5` / [PR #12](https://github.com/NejaTive/Topic/pull/12) / (merge в develop)
- **Заметки:** чеклист ревью в карточке YouGile; `typecheck`/`build`; `gen:api` без diff schema; smoke `GET /api/health` напрямую и через Vite proxy; при API down proxy 500 (UI → «недоступен»); UI browser MCP недоступен.
- **Доработка после ревью:** нет
- **Длительность:** реализация ~6 мин · ревью ~6 мин · всего ~12 мин

### 06.10.2026 — Подключить PWA через vite-plugin-pwa

- **YouGile:** FRO-4
- **Итог:** `vite-plugin-pwa` в `apps/web`: manifest Topic (lang ru, standalone, theme `#0F6B5C`, bg `#F6F7F5`); placeholder-иконки 192/512/maskable в `public/icons/`; Workbox precache app-shell, `navigateFallback: /index.html`, denylist `/^\/api\//`, без `runtimeCaching`; `registerType: prompt` + `useAppUpdate()`; SW в dev выключен; `theme-color` в `index.html`.
- **Репо:** `feat/FRO-4` / [PR #11](https://github.com/NejaTive/Topic/pull/11) / (merge в develop)
- **Заметки:** чеклист ревью в карточке YouGile; проверка `typecheck`/`build`/`preview` (HTTP manifest/sw/icons); иконки `#0F6B5C` + «T»; UI browser MCP / Lighthouse Installable не гонялись — SW denylist и отсутствие runtimeCaching по сгенерированному `dist/sw.js`.
- **Доработка после ревью:** нет
- **Длительность:** реализация ~4 мин · ревью ~3 мин · всего ~7 мин

### 06.10.2026 — Подключить TanStack Vue Query и Pinia

- **YouGile:** FRO-3
- **Итог:** `@tanstack/vue-query` + `pinia` в `main.ts`; `QueryClient` (`retry: 1`, `refetchOnWindowFocus: false`) в `src/query/client.ts`; фабрики `queryKeys` (пока `health`); setup-стор `useSessionStore` (`user`/`status`/`setUser`/`clear`, без API и localStorage); README про разделение Query/Pinia/ключи.
- **Репо:** `feat/FRO-3` / [PR #10](https://github.com/NejaTive/Topic/pull/10) / (merge в develop)
- **Заметки:** чеклист ревью в карточке YouGile; UI browser MCP не использовался — `typecheck`/`build`, HTTP `/` на Vite, проверка исходников AC/границ.
- **Доработка после ревью:** нет
- **Длительность:** реализация ~2 мин · ревью ~3 мин · всего ~5 мин

### 06.10.2026 — Подключить Tailwind v4, дизайн-токены и шрифты

- **YouGile:** FRO-2
- **Итог:** Tailwind v4 (`@tailwindcss/vite`) + `src/styles/main.css`/`tokens.css` (`@theme static` 1:1 из `docs/design/tokens.json`, сброс дефолтных `--color-*`/`--radius-*`); `--color-focus-ring` из stage-2; типографика `text-*` + `@utility text-overline`; self-host Onest Variable + JetBrains Mono 500; placeholder `/` для визуальной проверки токенов.
- **Репо:** `feat/FRO-2` / [PR #9](https://github.com/NejaTive/Topic/pull/9) / (merge в develop)
- **Заметки:** чеклист ревью в карточке YouGile; UI browser MCP недоступен — проверка через `typecheck`/`build`, HTTP `/`, собранный CSS (`--color-accent: #0f6b5c`, без CDN/googleapis, без `bg-red-500`/`rounded-full`); focus-ring отмечен в claim.
- **Доработка после ревью:** нет
- **Длительность:** реализация ~3 мин · ревью ~6 мин · всего ~9 мин

### 06.10.2026 — Настроить ESLint и Prettier для монорепо

- **YouGile:** BAC-6
- **Итог:** Корневой ESLint 9+/10 flat config (`eslint.config.js`: `@eslint/js`, typescript-eslint recommended, eslint-plugin-vue, globals node/browser, `eslint-config-prettier` последним); Prettier отдельно (`.prettierrc.json` / `.prettierignore`); скрипты `lint`/`lint:fix`/`format`/`format:check`; `"type":"module"`; README «Линтинг и форматирование»; разовый format по коду.
- **Репо:** `feat/BAC-6` / [PR #8](https://github.com/NejaTive/Topic/pull/8) / (merge в develop)
- **Заметки:** чеклист ревью в карточке YouGile; husky/CI/type-checked/tailwind-plugin — out of scope; комментарии в чат YouGile через MCP недоступны.
- **Доработка после ревью:** нет
- **Длительность:** реализация ~4 мин · ревью ~3 мин · всего ~7 мин

### 06.10.2026 — Создать Vue 3 SPA в apps/web

- **YouGile:** FRO-1
- **Итог:** Workspace-пакет `apps/web` (Vite + Vue 3 script setup + TS strict, tsconfig extends base + node-конфиг): Router `/` → HomePage «Topic», App только RouterView; alias `@→src`, proxy `/api→:3001`; скрипты `dev`/`build`(+typecheck)/`preview`/`typecheck`; `index.html` lang=ru; README с конвенциями; без boilerplate create-vue.
- **Репо:** `feat/FRO-1` / [PR #7](https://github.com/NejaTive/Topic/pull/7) / (merge в develop)
- **Заметки:** чеклист ревью в карточке YouGile; Tailwind/Query/Pinia/PWA/API-клиент — FRO-2…5; UI browser MCP недоступен — Topic проверен через Vite-модуль HomePage + HTTP.
- **Доработка после ревью:** нет
- **Длительность:** реализация ~4 мин · ревью ~3 мин · всего ~7 мин

### 06.10.2026 — Подключить OpenAPI и экспорт спецификации

- **YouGile:** BAC-2
- **Итог:** `@nestjs/swagger`: Swagger UI `/api/docs`, JSON `/api/openapi.json` (title «Topic API», version из `apps/api/package.json`); Health DTO + `@ApiOkResponse`/`@ApiServiceUnavailableResponse`; общая `buildOpenApiDocument`/`setupOpenApi`; `openapi:export` без listen/БД; `openapi.json` в `.gitignore`; раздел «Контракт API» в README.
- **Репо:** `feat/BAC-2` / [PR #6](https://github.com/NejaTive/Topic/pull/6) / (merge в develop)
- **Заметки:** комментарии в чат YouGile через MCP недоступны (чеклист ревью в карточке); FRO-5 (`gen:api`) и security/cookie-auth — out of scope.
- **Доработка после ревью:** нет
- **Длительность:** реализация ~3 мин · ревью ~5 мин · всего ~8 мин

### 06.10.2026 — Подключить Prisma и эндпоинт GET /api/health

- **YouGile:** BAC-3
- **Итог:** Prisma 7.10 + `@prisma/adapter-pg` + dotenv: пустая schema без моделей, `prisma.config.ts`, глобальные PrismaModule/Service (lazy connect, `$disconnect` на shutdown), скрипты `db:generate`/`db:migrate`/`db:studio`, `prebuild` → generate; `GET /api/health` → 200 `{status:ok,db:up}` / 503 `{status:error,db:down}`; `DATABASE_URL` обязателен, в `.env.example` как дефолты compose BAC-5 (`topic`/`topic`).
- **Репо:** `feat/BAC-3` / [PR #4](https://github.com/NejaTive/Topic/pull/4) / `53dedc0`
- **Заметки:** пароль в AC-тексте (`topic_dev_password`) устарел — взяты дефолты compose BAC-5; моделей нет (по scope); комментарии в чат YouGile через MCP недоступны, чеклист ревью в карточке.
- **Доработка после ревью:** нет
- **Длительность:** реализация ~5 мин · ревью ~5 мин · всего ~10 мин

### 06.10.2026 — Поднять Postgres и MinIO через docker compose

- **YouGile:** BAC-5
- **Итог:** Корневой `compose.yaml` (Postgres 17 + MinIO + one-shot `minio-init` → бакет `topic-covers`), порты на `127.0.0.1`, дефолты `${VAR:-default}`; `.env.example`; скрипты `infra:up`/`down`/`reset`; раздел «Инфраструктура» в README. Образы `coollabsio/minio` + `pgsty/mc` вместо официальных `minio/*` (анонимный pull недоступен с осени 2026) — зафиксировано в compose/README.
- **Репо:** `feat/BAC-5` / [PR #3](https://github.com/NejaTive/Topic/pull/3) / `484a634`
- **Заметки:** api/Dockerfile/S3/политика бакета — out of scope; `.env` не создавался; комментарии в чат YouGile через MCP недоступны, чеклист ревью в карточке. Длительность — ретрооценка 07.10.2026 (аналог BAC-3 / с учётом смены образов MinIO).
- **Доработка после ревью:** нет
- **Длительность:** реализация ~6 мин · ревью ~4 мин · всего ~10 мин

### 05.10.2026 — Создать Nest-приложение apps/api

- **YouGile:** BAC-4
- **Итог:** Workspace-пакет `apps/api` (Nest 12): скрипты `dev`/`build`/`start`/`typecheck`, `main.ts` (PORT 3001, prefix `api`, ValidationPipe, shutdown hooks), глобальный ConfigModule с валидацией `PORT`/`NODE_ENV` через class-validator, `.env.example`, пустой `AppModule` без hello-world и без eslint/jest/prettier.
- **Репо:** `feat/BAC-4` / [PR #2](https://github.com/NejaTive/Topic/pull/2) / `166c141`
- **Заметки:** Prisma/health — BAC-3; OpenAPI — BAC-2; ESLint — BAC-6; комментарии в чат YouGile через MCP недоступны, чеклист ревью в карточке. Длительность — ретрооценка 07.10.2026 (аналог FRO-1 scaffold).
- **Доработка после ревью:** нет
- **Длительность:** реализация ~4 мин · ревью ~3 мин · всего ~7 мин

### 05.10.2026 — Инициализировать pnpm-монорепо

- **YouGile:** BAC-1
- **Итог:** Корневой pnpm-монорепо (`apps/*`, `packages/*`), `packageManager` pnpm@9.14.2, Node ≥20, `tsconfig.base.json` (strict, ES2022), editorconfig/gitattributes, корневые скрипты `dev`/`build`/`typecheck`, README. Приложения не создавались (по AC).
- **Репо:** `feat/BAC-1` / [PR #1](https://github.com/NejaTive/Topic/pull/1) / `8a34e73`
- **Заметки:** стек apps ещё нет — проверка скриптов на пустом workspace; комментарии в чат YouGile через MCP недоступны, чеклист ревью записан в карточку. Длительность — ретрооценка 07.10.2026 (аналог BAC-6 / FRO-1).
- **Доработка после ревью:** нет
- **Длительность:** реализация ~4 мин · ревью ~3 мин · всего ~7 мин


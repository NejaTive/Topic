# apps/web

Vue 3 SPA (Vite + TypeScript + Vue Router + Tailwind v4).

- `src/pages/` — страницы маршрутов (PascalCase, суффикс `Page`)
- `src/router/` — Vue Router (`createWebHistory`)
- `src/components/ui/` — UI-Kit контролы (`AppButton`, `AppInput`, `AppNav`, `GuestNav`, `TopicRow`, `PrivacyChip`, `RankRow`, `CoverUpload`, `MainChip`; реэкспорт из `index.ts`)
- `src/styles/` — `main.css` (Tailwind + шрифты) и `tokens.css` (`@theme` из `docs/design/tokens.json`)
- `src/composables/` — composables (в т.ч. `useAppUpdate` для обновления SW)
- `src/App.vue` — только `RouterView`
- `src/main.ts` — точка входа (Vue Query + Pinia)
- `public/icons/` — иконки PWA

**UI-Kit:** `AppButton` (primary / secondary / ghost / danger-ghost; размеры `md` 44 и `sm` 32; `loading` блокирует клик); `AppInput` (label, `v-model`, text/password/email, error снизу); `PrivacyChip` (`private` / `unlisted` / `public`; `compact` = icon-only для M); `TopicRow` (title, meta, privacy, optional covers, hover); `AppNav` (floating dock: bottom M / top D / `auto`; M tabs «Лента|Мои топики|Профиль» + soft-well; D: Topic + links + soft-pill active; «Лента»/«Профиль» disabled до S13/профиля); `GuestNav` (`ctaMode`: `share` — S09 Primary «Присоединиться»→`/`; `error` — «На главную»; `guest` — «Войти»+«Присоединиться» для витрины; props override); `RankRow` (cover thumb, title, rank badge top-3 accent, drag-handle, inbox «В рейтинг»; states default/hover/focus/dragging; max-width 358; HTML5 DnD на S05 через `dragEnabled` — ranked только с handle, inbox со строки; без ↑↓); `CoverUpload` (empty/hover/filled/error, file input, emit `file` для multipart, copy «до 5 МБ»); `MainChip` (Фильмы/Сериалы/Книги/Игры → emit `select` label в title). Без баннера «Топик изменился» (Flow E). Стили только через токены Tailwind (`tokens.css`); focus — `outline-focus-ring` (2px / offset 2px). Импорт: `import { AppButton, CoverUpload, MainChip, RankRow } from '@/components/ui'`. Временная витрина: `/dev/ui-kit`.

**Данные:** server state — TanStack Vue Query (`src/query/client.ts`); клиентская сессия — Pinia `useSessionStore` (`src/stores/session.ts`, без персиста): `unknown` → `guest` | `authed` через `GET /api/auth/me` при старте. Фабрики ключей — `src/query/keys.ts` (`health`, `auth.me`, `topics.list`, `share.detail`). Auth mutations: `useRegisterMutation` / `useLoginMutation` / `useLogoutMutation`; query — `useMeQuery`. Topics: `useTopicsQuery` → `GET /api/topics`; `useCreateTopicMutation` → `POST /api/topics` (`src/api/topics.ts`). Share: `useShareQuery` → `GET /api/t/:shareId` (`src/api/share.ts`). previewCovers → URL через `src/lib/cover-url.ts` (дефолты MinIO = api `.env.example`; опционально `VITE_S3_PUBLIC_URL` / `VITE_S3_BUCKET`). S05: `useTopicQuery` + `useTopicItemsQuery`; `useRankItemMutation` (inbox→конец); `useReorderItemsMutation` (optimistic ranked DnD + rollback).

**Router:** `guestOnly` (`/`, `/login`, `/register`) — authed → `/app/topics`; `requiresAuth` (`/app/*`) — guest → `/login?returnUrl=…`. `/` — лендинг S00; `/app` → `/app/topics` (S03: AppNav + TopicRow + empty/FAB → S04; tap row → S05). `/app/topics/new` — S04 создание (title + MainChip → text без presetKey; PrivacyChip selector, default unlisted; POST → `/app/topics/:id`). `/app/topics/:id` — S05 редактор (privacy, lists, native DnD ranked + inbox→end). `/t/:shareId` — S09 share-view (гость: GuestNav `share`; авторизованный: AppNav; read-only ranked; без redirect на S05); API 403 → `/share/no-access` (S11), 404 → `/share/not-found` (S12); catch-all неизвестных URL → S12 (`NotFoundPage`). S11/S12 — `ErrorStateView` + GuestNav `ctaMode=error` («На главную» → `/`); без AppNav.

**API-клиент:** `openapi-fetch` + типы из `src/api/schema.d.ts` (`src/api/client.ts`, `credentials: 'include'`). Typed auth helpers — `src/api/auth.ts`. Базовый 401 → guest. После изменений контракта Nest: в корне `pnpm gen:api` и закоммитить обновлённый `schema.d.ts` (файл generated, не править вручную). Локально: `pnpm --filter web gen:api` (нужен свежий `apps/api/openapi.json`).

**PWA:** `vite-plugin-pwa` — manifest + precache app-shell; API не кешируется (`navigateFallbackDenylist: [/^\/api\//]`, без `runtimeCaching`). Обновление SW — `registerType: 'prompt'` через `useAppUpdate()` (UI обновления пока нет). В `dev` SW выключен.

**Иконки:** в `public/icons/` сейчас placeholder (плашка `#0F6B5C` + белая «T»: 192, 512, maskable 512). Финальный арт — позже.

Шрифты self-host: Onest Variable (`@fontsource-variable/onest`), JetBrains Mono 500 (`@fontsource/jetbrains-mono`). Без CDN.

`pnpm --filter web dev` → http://localhost:5173 (прокси `/api` → `:3001`).

Проверка PWA: `pnpm --filter web build && pnpm --filter web preview` → DevTools → Application (Manifest / Service Worker).

# apps/web

Vue 3 SPA (Vite + TypeScript + Vue Router + Tailwind v4).

- `src/pages/` — страницы маршрутов (PascalCase, суффикс `Page`)
- `src/router/` — Vue Router (`createWebHistory`)
- `src/components/ui/` — UI-Kit контролы (`AppButton`, `AppInput`; реэкспорт из `index.ts`)
- `src/styles/` — `main.css` (Tailwind + шрифты) и `tokens.css` (`@theme` из `docs/design/tokens.json`)
- `src/composables/` — composables (в т.ч. `useAppUpdate` для обновления SW)
- `src/App.vue` — только `RouterView`
- `src/main.ts` — точка входа (Vue Query + Pinia)
- `public/icons/` — иконки PWA

**UI-Kit:** `AppButton` (primary / secondary / ghost / danger-ghost; размеры `md` 44 и `sm` 32; `loading` блокирует клик) и `AppInput` (label, `v-model`, text/password/email, error снизу). Стили только через токены Tailwind (`tokens.css`); focus — `outline-focus-ring` (2px / offset 2px). Импорт: `import { AppButton, AppInput } from '@/components/ui'`. Временная витрина: `/dev/ui-kit`.

**Данные:** server state — TanStack Vue Query (`src/query/client.ts`); клиентская сессия — Pinia `useSessionStore` (`src/stores/session.ts`, без персиста). Фабрики ключей запросов — `src/query/keys.ts` (пока только `health`).

**API-клиент:** `openapi-fetch` + типы из `src/api/schema.d.ts` (`src/api/client.ts`, `credentials: 'include'`). После изменений контракта Nest: в корне `pnpm gen:api` и закоммитить обновлённый `schema.d.ts` (файл generated, не править вручную). Локально: `pnpm --filter web gen:api` (нужен свежий `apps/api/openapi.json`).

**PWA:** `vite-plugin-pwa` — manifest + precache app-shell; API не кешируется (`navigateFallbackDenylist: [/^\/api\//]`, без `runtimeCaching`). Обновление SW — `registerType: 'prompt'` через `useAppUpdate()` (UI обновления пока нет). В `dev` SW выключен.

**Иконки:** в `public/icons/` сейчас placeholder (плашка `#0F6B5C` + белая «T»: 192, 512, maskable 512). Финальный арт — позже.

Шрифты self-host: Onest Variable (`@fontsource-variable/onest`), JetBrains Mono 500 (`@fontsource/jetbrains-mono`). Без CDN.

`pnpm --filter web dev` → http://localhost:5173 (прокси `/api` → `:3001`).

Проверка PWA: `pnpm --filter web build && pnpm --filter web preview` → DevTools → Application (Manifest / Service Worker).

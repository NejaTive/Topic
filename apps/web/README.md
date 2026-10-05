# apps/web

Vue 3 SPA (Vite + TypeScript + Vue Router + Tailwind v4).

- `src/pages/` — страницы маршрутов (PascalCase, суффикс `Page`)
- `src/router/` — Vue Router (`createWebHistory`)
- `src/styles/` — `main.css` (Tailwind + шрифты) и `tokens.css` (`@theme` из `docs/design/tokens.json`)
- `src/App.vue` — только `RouterView`
- `src/main.ts` — точка входа (Vue Query + Pinia)

**Данные:** server state — TanStack Vue Query (`src/query/client.ts`); клиентская сессия — Pinia `useSessionStore` (`src/stores/session.ts`, без персиста). Фабрики ключей запросов — `src/query/keys.ts` (пока только `health`).

Шрифты self-host: Onest Variable (`@fontsource-variable/onest`), JetBrains Mono 500 (`@fontsource/jetbrains-mono`). Без CDN.

`pnpm --filter web dev` → http://localhost:5173 (прокси `/api` → `:3001`).

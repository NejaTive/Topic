# apps/web

Vue 3 SPA (Vite + TypeScript + Vue Router + Tailwind v4).

- `src/pages/` — страницы маршрутов (PascalCase, суффикс `Page`)
- `src/router/` — Vue Router (`createWebHistory`)
- `src/styles/` — `main.css` (Tailwind + шрифты) и `tokens.css` (`@theme` из `docs/design/tokens.json`)
- `src/App.vue` — только `RouterView`
- `src/main.ts` — точка входа

Шрифты self-host: Onest Variable (`@fontsource-variable/onest`), JetBrains Mono 500 (`@fontsource/jetbrains-mono`). Без CDN.

`pnpm --filter web dev` → http://localhost:5173 (прокси `/api` → `:3001`).

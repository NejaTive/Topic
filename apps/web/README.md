# apps/web

Vue 3 SPA (Vite + TypeScript + Vue Router).

- `src/pages/` — страницы маршрутов (PascalCase, суффикс `Page`)
- `src/router/` — Vue Router (`createWebHistory`)
- `src/App.vue` — только `RouterView`
- `src/main.ts` — точка входа

`pnpm --filter web dev` → http://localhost:5173 (прокси `/api` → `:3001`).

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
```

---

## Записи

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

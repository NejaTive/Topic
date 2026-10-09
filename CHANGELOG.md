# Changelog

История релизов Topic. Формат: список изменений текстом (буллеты).  
Канон в репо; при релизе дублируется в **GitHub Release** на тег `vX.Y.Z` (skill `publish-prod`).

## [0.2.1] — 2026-10-09

- Ускорен Deploy: параллельные билды API/web, slim runtime API (BAC-16).

## [0.2.0] — 2026-10-09

- HTTPS на IP через Let's Encrypt short-lived (BAC-15).
- Fallback копирования share-ссылки на HTTP (FRO-27).
- AuthLayout / MainLayout и декомпозиция components (FRO-26).

## [0.1.2] — 2026-10-08

- Убрана accent-обводка RankedDropZone при drag-over (FRO-25).

## [0.1.1] — 2026-10-08

- Same-origin URL обложек за Caddy в prod.

## [0.1.0] — 2026-10-08

- CI/CD деплой на VPS через GHCR и Caddy (BAC-14).
- Публичный Share API и S09 share-view (BAC-13, FRO-19).
- GuestNav для guest chrome S09 (FRO-18).
- S11/S12 ошибки доступа и 404 (FRO-20).
- DnD рейтинга на @vue-dnd-kit с live-gap (FRO-24).
- Выравнивание Topics UI / AppNav / GuestNav по макетам (FRO-22, FRO-23).
- Клиентская валидация Auth и русские сообщения ошибок (FRO-21).
- Semver git-теги для релизов.

# Changelog

История релизов Topic. Формат: список изменений текстом (буллеты).  
Канон в репо; при релизе дублируется в **GitHub Release** на тег `vX.Y.Z` (skill `publish-prod`).

Без id карточек YouGile (BAC-/FRO-) в тексте — только смысл для человека.

## [0.3.1] — 2026-10-12

- Домен topi-ki.ru: обычный Let's Encrypt, www → apex.
- Канон origin https://topi-ki.ru (вместо HTTPS на IP).

## [0.3.0] — 2026-10-12

- Подписки и лента public-топиков; публичный профиль `/u/:nick`.
- Табы «Лента» / «Профиль» в AppNav; PageShell и скролл списков.
- Тёмная green-палитра, liquid-glass, sliding soft-well в nav, page-fade.
- Confirm-модалка для удаления и выхода.
- Выход и копирование ссылки на своём профиле; назад на share-view.
- MVP зафиксирован (этап 5 закрыт).

## [0.2.1] — 2026-10-09

- Ускорен Deploy: параллельные билды API/web, slim runtime API.

## [0.2.0] — 2026-10-09

- HTTPS на IP через Let's Encrypt short-lived.
- Fallback копирования share-ссылки на HTTP.
- AuthLayout / MainLayout и декомпозиция components.

## [0.1.2] — 2026-10-08

- Убрана accent-обводка RankedDropZone при drag-over.

## [0.1.1] — 2026-10-08

- Same-origin URL обложек за Caddy в prod.

## [0.1.0] — 2026-10-08

- CI/CD деплой на VPS через GHCR и Caddy.
- Публичный Share API и share-view по ссылке.
- GuestNav для гостевого chrome на share.
- Экраны ошибок доступа и 404.
- DnD рейтинга на @vue-dnd-kit с live-gap.
- Выравнивание Topics UI / AppNav / GuestNav по макетам.
- Клиентская валидация Auth и русские сообщения ошибок.
- Semver git-теги для релизов.

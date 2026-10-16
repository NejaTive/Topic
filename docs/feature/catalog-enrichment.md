# Каталог при добавлении элементов (enrichment)

План фичи post-MVP. Решения: [`../process/decisions.md`](../process/decisions.md) (15.10.2026). Идея в backlog: [`../backlog/ideas.md`](../backlog/ideas.md) («Категории топиков»).

## Проблема

На S06 пользователь вручную вводит название и (часто) ищет/грузит обложку. На длинном топе это главный friction.

## Решение (вариант A)

Жёсткий enum **категории топика** + поиск во внешнем открытом API для известных категорий. Своя категория — без автодополнения. В каталожном топике всегда остаётся путь «создать свой элемент» вручную.

**Одна модель `Item`:** title + cover (как сейчас). Каталог только **заполняет** поля, не добавляет «карточку фильма» (жанры, рейтинг провайдера и т.п.).

## Scope v1 (+ series 16.10.2026)

| В scope | Вне scope (позже) |
|---------|-------------------|
| Категории: `movies` \| `series` \| `custom` | `games`, `books`, … |
| Провайдер: **TMDB** (movie + TV search/poster) | Unfurl произвольных URL |
| S04: выбор категории при создании | Смена категории у существующего топика (отдельное решение) |
| S06: поиск → выбор → create; или ручной create | Share Target / PWA «поделиться» |
| Обложку с CDN провайдера **копируем** в MinIO | Горячие ссылки на чужой CDN |
| Ключ TMDB только на Nest | Прямые вызовы TMDB из браузера |

## Что значит «не храним external id» (п.3)

Речь не про UX, а про БД:

- **Связь с каталогом** — поля вроде `externalSource = tmdb`, `externalId = "343611"` на `Item`.
- **v1:** при выборе из поиска один раз копируем **title + обложку** в наш `Item` и **не** сохраняем id фильма в TMDB.
- **Зачем вообще бывает нужно:** дедуп («этот фильм уже в топике»), позже «обновить постер», глубокая ссылка на TMDB.
- **Почему откладываем:** проще модель и миграции; для снятия friction связи с каталогом не обязательны. Вернуться явно, если понадобится дедуп.

## Модель данных

### Topic

- Поле: `category` — enum `movies` | `series` | `custom`.
- Дефолт при создании: **`custom`** (если чип не выбран).
- Существующие топики при миграции → `custom`.
- Смена `category` после create в v1 не поддерживается.

### Item

- Общие поля: `title` + опциональный cover (upload или скачивание при импорте из поиска).
- Опциональный **`meta Json?`** — category-specific поля на том же `Item` (не отдельные колонки / таблицы).
  - **`movies` / `series` (вариант A):** одни и те же опциональные строки `description`, `director`, `genre`, `country` (singular; пустая строка → ключ отсутствует / `meta` null); `sourceUrl` — только server-set при from-catalog (TMDB page), в create/update с клиента игнорируется. Для series UI-лейбл `director` → «Создатель»; в TMDB → `created_by[0]`.
  - **`custom`:** `meta` всегда `null`; передача `meta` в create/update → `400`.
  - Каталожный и ручной элемент в топике movies/series — один контракт редактируемых полей; `sourceUrl` только у импортированных.
  - Будущие категории (`books`, …): другие ключи в том же `meta`, валидация по `topic.category`.

## API (Nest)

Все вызовы провайдера — с бэкенда. Ключ: `TMDB_API_KEY` (или read access token) в `apps/api/.env`; в `.env.example` — пустой плейсхолдер.

Предлагаемый контур (имена можно уточнить при нарезке карточек):

1. **`GET /api/catalog/movies/search?q=`** и **`GET /api/catalog/series/search?q=`** (auth: владелец сессии)  
   → нормализованный список `{ providerId, title, year?, imageUrl? }` (для UI строки поиска; `providerId` **не** обязан попадать в БД Item).

2. **Импорт в элемент** — один из вариантов при реализации:  
   - **A1:** `POST /api/topics/:topicId/items/from-catalog` body `{ provider: 'tmdb', providerId }` → Nest тянет детали/постер по `topic.category` (movie vs tv) → create Item + cover в MinIO;  
   - **A2:** фронт после выбора шлёт обычный create + отдельный «cover by url» на Nest.  
   Предпочтение плана: **A1** (меньше дыр, один транзакционный UX).

3. Ручной путь: `POST .../items` + optional cover multipart; для `movies` | `series` — опциональный `meta: { description?, director?, genre?, country? }`.
4. `from-catalog` дополняет `meta` из TMDB details (`overview` → description; movie: первый Director из credits; series: первый `created_by`; первый genre / production country; `sourceUrl` → `/movie/{id}` или `/tv/{id}`).

Ошибки поиска: fail-soft (пустой список / сообщение), ручное создание не блокировать. Rate-limit / таймаут к TMDB — на Nest.

## UX

### S04 Создание топика

- Чипы категории: **Фильмы** | **Сериалы** | **Своё**.
- Для `movies` / `series` название можно префиллить «Фильмы» / «Сериалы»; пользователь может переименовать.
- Privacy — без изменений.

### S06 Добавить элемент

- Если `topic.category === 'movies' | 'series'`: поле поиска → debounce → список из API (movies или series) → выбор → from-catalog (title + cover + meta); ссылка/кнопка «Указать вручную» → форма обложка → название → описание → жанр → режиссёр/создатель → страна.
- Если `custom`: только title + CoverUpload (без поиска и без meta-полей).
- S07 (редактирование): те же meta-поля при `movies` | `series` (лейбл director: «Режиссёр» / «Создатель»); `sourceUrl` — read-only ссылка «Источник», если есть. Список ранга / RankRow — без meta в первом slice (поля уже в API / ShareItemDto).

### Атрибуция

- Мелко у результатов поиска: источник данных TMDB (требование ToS non-commercial).

## Провайдер: TMDB (выбрано 15.10.2026)

**Решение владельца:** для категории `movies` используем **[The Movie Database (TMDB) API](https://developer.themoviedb.org/)**.

Почему не альтернативы (исследование 15.10.2026):

| Кандидат | Почему не взяли в v1 |
|----------|----------------------|
| OMDb | 1000 req/день; RU-названия слабее; hi-res Poster API платный |
| kino.is | Без ключа и RU-first, но на момент выбора origin недоступен (5xx) |
| Kinopoisk Unofficial / ПоискКино | Неофициальные/жёсткие квоты; риск ToS и отвала |
| No-key скрейперы IMDb | Нестабильно и серо юридически |

Контракт использования:

- Endpoint: movie search; в ответе минимум `title` + `poster_path` (+ year для строки UI).
- Язык запросов: `language=ru` (fallback на `original_title` / en, если локализованного title нет).
- Poster: `https://image.tmdb.org/t/p/…` + path → скачать на Nest → sharp webp → MinIO (не горячая ссылка в браузере пользователя).
- Секрет: `TMDB_API_KEY` или Read Access Token только в `apps/api/.env`; в `.env.example` — пустой плейсхолдер; во фронт не отдаём.
- ToS: free **non-commercial** + attribution в UI поиска / About («This product uses the TMDB API but is not endorsed or certified by TMDB.»); при коммерциализации — отдельный пересмотр.

## Этапы внедрения

1. **Контракт и docs** — этот файл + decisions (✅).
2. **Нарезка YouGile** — ✅ 15.10.2026 (см. ниже); hi-fi не блокирует.
3. **Backend:** BAC-21 → BAC-22 → BAC-23 → BAC-24.
4. **Frontend:** FRO-36 → FRO-37 → FRO-38 → FRO-39.
5. **Проверка:** топик «Фильмы» → поиск → элемент с обложкой и meta в MinIO/API; ручной create с полями; `custom` → как сейчас без meta; без ключа TMDB — деградация без падения create.

## Нарезка YouGile ✅

Эпик **Catalog** (стикер «Эпик Catalog» = `Catalog` на досках BAC/FRO). Карточки в колонке **Бэклог**. Отдельной hi-fi-карточки нет — UI по этому docs.

| ID | Задача | Зависит от |
|----|--------|------------|
| **BAC-21** | `Topic.category` (`movies` \| `custom`): Prisma + миграция + CreateTopicDto / TopicDto / OpenAPI | — |
| **BAC-22** | TMDB env + клиент + `GET /api/catalog/movies/search` | — |
| **BAC-23** | `POST .../items/from-catalog` (TMDB → Item + cover MinIO) | BAC-21, BAC-22 |
| **BAC-24** | `Item.meta` Json + movies fields (director/genre/country) в create/update/from-catalog/OpenAPI | BAC-23 |
| **FRO-36** | Catalog API-клиент (category + search + from-catalog) | BAC-21, BAC-22, BAC-23 |
| **FRO-37** | S04: чипы Фильмы / Своё | FRO-36 |
| **FRO-38** | S06: поиск TMDB + from-catalog + ручной fallback | FRO-36, FRO-37 |
| **FRO-39** | S06/S07: поля Режиссёр / Жанр / Страна для `movies` | BAC-24, FRO-38 |

Порядок исполнения: BAC-21 → … → BAC-23 → FRO-36…38 → BAC-24 → FRO-39 (executor’ов не параллелить по умолчанию).

### Зафиксировано при нарезке

- Дефолт `category` без выбора чипа: **`custom`**.
- Год — только в строке поиска на S06.
- Смена `category` после create в v1 **нет** (только create; PATCH без поля).
- Импорт: **A1** `from-catalog`.

## Нарезка YouGile — series (16.10.2026)

| ID | Задача | Зависит от |
|----|--------|------------|
| **BAC-26** | `series`: Prisma + TMDB TV search/from-catalog + meta (зеркало movies) | BAC-21…25 |
| **FRO-41** | S04/S06/S07: чип Сериалы + поиск TV + meta («Создатель») | BAC-26 |

Порядок: BAC → FRO. PR base: **`develop`**.

## Не делаем в этом slice

- Игры / книги и прочие адаптеры (другие ключи `meta` — позже).
- Отдельный ключ `creator` (для series используем `director` + UI-лейбл).
- Рейтинг TMDB, трейлеры, множественные жанры/страны/режиссёры, сезоны/network.
- Meta в RankRow / S09 UI (поля уже в API).
- Хранение `externalSource` / `externalId` на Item.
- Смена `category` у топика после создания.
- OG-превью share-страницы `/t/:shareId` (другая фича).
- Отдельная Design/hi-fi карточка YouGile.

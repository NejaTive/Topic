# Этап 5 — Закрытие MVP (follow + лента)

> Статус: ✅ закрыт владельцем (**12.10.2026**).  
> Опора: [`stage-1-brainstorm.md`](stage-1-brainstorm.md) (S10, Follow, S13); hi-fi на этапе 2 / **5b**.  
> Этап 4 ✅ ([`stage-4-brainstorm.md`](stage-4-brainstorm.md)). MVP Must-срез зафиксирован; **5f** не входил в закрытие.

---

## Цель этапа

1. Закрыть Must MVP по **подписке и ленте**: публичный профиль (S10), follow, лента public-топиков (S13).
2. Добить **hi-fi** S10/S13 (wireframes уже есть на этапе 2) и оживить табы «Лента» / «Профиль» в AppNav.
3. Нарезать и реализовать соцсрез в YouGile (BAC + FRO) без смены стека.
4. Хвост (**5f**) из [`../backlog/ideas.md`](../backlog/ideas.md) — **не делали** при закрытии MVP (post-MVP / отдельное решение).

---

## Решения владельца (kickoff 09.10.2026)

- Модель соцсвязи: **односторонняя подписка (follow)** — без заявок и взаимности (как stage-1 §Follow / Flow C–D).
- Scope этапа: **соцсрез** S10 + follow + S13 (+ дизайн, API, нарезка, реализация); хвост из `ideas` — последними пунктами.
- Терминология в UI/docs: **«Подписаться» / «подписка»**, не «друзья» / «добавить в друзья».

---

## Продуктовый контракт (из stage-1, не переизобретаем)

- Подписка с `/u/:nick` (S10); на себя нельзя; счётчики подписчиков — nice-to-have, в MVP достаточно кнопки.
- Лента = **public**-топики пользователей, на которых подписан; сортировка по `topic.updatedAt`; **unlisted и private в ленту не попадают**.
- Discovery без глобального поиска: профиль по ссылке / нику.
- Не activity-stream на каждый DnD.
- Модель `Follow`: уникальная пара `(followerId, followingId)`, `followerId ≠ followingId`.

### Не делаем на этапе 5 (кроме возможного хвоста 5f)

- Взаимные друзья / заявки «добавить в друзья».
- Глобальный поиск пользователей.
- Лайки, комменты, богатый activity-stream.
- ↑↓ / позиция N, «Топик изменился», OG, S08 и прочий `ideas` — **не в фокусе**; максимум 1–2 в **5f** после выбора владельца.

---

## Источники истины

| Что | Где |
|-----|-----|
| Продукт IA / Follow / лента | [`stage-1-brainstorm.md`](stage-1-brainstorm.md) |
| Wireframes S10/S13 | этап 2 (Figma); hi-fi — фаза **5b** |
| Стек | [`stage-3-brainstorm.md`](stage-3-brainstorm.md), `tech-stack.mdc` |
| Задачи, AC, статусы | **YouGile** (нарезка — **5d**) |
| Устойчивые решения | [`../process/decisions.md`](../process/decisions.md) |
| История выполнения | [`../process/task-history.md`](../process/task-history.md) |

---

## Фазы этапа 5

| Фаза | Содержание | Статус |
|------|------------|--------|
| **5a** | Docs kickoff: документ этапа, контракт follow, границы «не делаем» | ✅ 09.10.2026 |
| **5b** | Дизайн: hi-fi S10 + S13 (M+D), empty states, Подписаться/Отписаться, карточка ленты; оживить табы nav | ✅ S13 + S10 (List / Empty / Subscribed / Own), M+D |
| **5c** | Контракт API/модель: `Follow`, subscribe/unsubscribe, лента public topics по following (в docs и/или AC) | ✅ аппрув владельца 09.10.2026 |
| **5d** | Нарезка YouGile (эпик Social / Follow+Feed): BAC + FRO с AC | ✅ 09.10.2026 |
| **5e** | Реализация по agent-workflow (Social BAC/FRO + UI) | ✅ 09–12.10.2026 (доски пусты; FRO-35 и др.) |
| **5f** | Хвост из `ideas.md` (1–2 пункта) | ⏭ не в MVP (отложено 12.10.2026) |

---

## Решения UI перед 5b (09.10.2026)

- Карточка ленты = Topic row как «Мои топики» (топ-3 обложки + title + meta); **без privacy-chip**.
- Таб «Профиль» → свой `/u/:nick` (S10).
- S10: лёгкие счётчики подписчиков / подписок; списки — не в MVP.
- Hi-fi: по одному экрану (M+D) с аппрувом; старт — S13.

**Отложено:** фильтры ленты («только за неделю») — post-MVP.

---

## 5c — Контракт API ✅

Префикс как сейчас: `/api`. Сессия — httpOnly cookie (как Topics/Auth). OpenAPI из Nest → клиент `openapi-typescript` / `openapi-fetch`. Пагинации в MVP нет (как `GET /topics`).

### Модель Prisma

```prisma
model User {
  // …существующее…
  topics           Topic[]
  following        Follow[] @relation("UserFollowing") // я → на кого
  followers        Follow[] @relation("UserFollowers") // кто → на меня
}

model Follow {
  id          String   @id @default(uuid())
  followerId  String
  followingId String
  createdAt   DateTime @default(now())

  follower  User @relation("UserFollowing", fields: [followerId], references: [id], onDelete: Cascade)
  following User @relation("UserFollowers", fields: [followingId], references: [id], onDelete: Cascade)

  @@unique([followerId, followingId])
  @@index([followingId])
  @@index([followerId])
}
```

Инварианты: `followerId ≠ followingId` (проверка в сервисе + опционально CHECK); уникальная пара.

### `GET /users/:nick` — публичный профиль (S10)

| | |
|--|--|
| Auth | **опционально**: без сессии — гость; с сессией — `isFollowing` / `isSelf` |
| `:nick` | case-insensitive (как unique nick) |
| 404 | пользователь с таким nick нет |

**Response `200` — `UserProfileDto`:**

| Поле | Тип | Смысл |
|------|-----|--------|
| `nick` | string | канонический nick из БД |
| `followersCount` | number | сколько подписчиков |
| `followingCount` | number | на скольких подписан |
| `topicsCount` | number | число **public**-топиков владельца |
| `isSelf` | boolean | сессия есть и `me.id ===` владелец профиля |
| `isFollowing` | boolean \| null | `null` без сессии; иначе подписан ли `me` на владельца |
| `topics` | `ProfileTopicDto[]` | только `privacy=public`, сортировка `updatedAt desc` |

**`ProfileTopicDto`** (карточка как Topic row без privacy-chip):

| Поле | Тип | Как у |
|------|-----|--------|
| `id` | uuid | `TopicListItemDto.id` |
| `shareId` | string | для перехода на `/t/:shareId` |
| `title` | string | |
| `updatedAt` | date-time | |
| `previewCovers` | `(string \| null)[]` | топ-3 ranked coverKey, как в `GET /topics` |

Без `privacy` в ответе (на S10 всегда public). Свой профиль на S10 тоже отдаёт **только public** (private/unlisted — в «Мои топики»).

### `POST /users/:nick/follow` — подписаться

| | |
|--|--|
| Auth | обязателен |
| 204 | ок (в т.ч. **идемпотентно**, если уже подписан) |
| 400 | подписка на себя |
| 401 | нет сессии |
| 404 | nick не найден |

Тела нет.

### `DELETE /users/:nick/follow` — отписаться

| | |
|--|--|
| Auth | обязателен |
| 204 | ок (в т.ч. если подписки не было) |
| 401 | нет сессии |
| 404 | nick не найден |

На себя: достаточно 404/400 не нужно — delete несуществующей связи → 204.

### `GET /feed` — лента (S13)

| | |
|--|--|
| Auth | обязателен |
| 200 | см. ниже |
| 401 | нет сессии |

**Response `FeedDto`:**

```ts
{
  followingCount: number; // для empty vs empty·subscribed одним запросом
  items: FeedItemDto[];
}
```

**`FeedItemDto`:**

| Поле | Тип | Смысл |
|------|-----|--------|
| `id` | uuid | topic id |
| `shareId` | string | клик по карточке → `/t/:shareId` |
| `title` | string | |
| `updatedAt` | date-time | сортировка ленты: `updatedAt desc` |
| `previewCovers` | `(string \| null)[]` | как у списка топиков |
| `ownerNick` | string | клик по автору → S10 (как `ownerNick` в Share) |

Правила выборки:

- топики с `privacy=public`;
- `ownerId` ∈ множество `followingId`, где `followerId = me`;
- **не** свои топики (даже public) — лента = чужие;
- unlisted/private не попадают никогда.

`items: []` + `followingCount: 0` → UI Empty; `items: []` + `followingCount > 0` → Empty·subscribed.

### Что не входит в контракт этапа 5

- Списки подписчиков / подписок (`GET …/followers`).
- Пагинация / cursor ленты и профиля.
- Фильтры ленты («за неделю»).
- Activity-stream по DnD.
- Расширение `GET /auth/me` счётчиками (берём с профиля / `followingCount` в feed).

### Маршруты фронта (напоминание, не API)

| UI | Route |
|----|--------|
| S10 | `/u/:nick` |
| S13 | `/app/feed` (или как зафиксировано в router; таб «Лента») |
| Таб «Профиль» | свой `/u/:nick` |

---

## 5d — Нарезка YouGile ✅

Эпик **Social** (стикер «Эпик (2)/(3)» — значение Social; старый «Эпик» без Social — для прошлых карточек).

| ID | Задача | Зависит от |
|----|--------|------------|
| **BAC-20** | Модель Follow в Prisma | — |
| **BAC-19** | Users profile API | BAC-20 |
| **BAC-18** | Follow API | BAC-20 |
| **BAC-17** | Feed API | BAC-20 |
| **FRO-30** | AppNav Лента/Профиль + роуты | — |
| **FRO-31** | Social API-клиент | BAC-19, BAC-18, BAC-17 |
| **FRO-29** | S10 профиль | FRO-31, FRO-30, BAC-19/18 |
| **FRO-28** | S13 лента | FRO-31, FRO-30, BAC-17 |

Порядок исполнения: BAC-20 → (BAC-19 ∥ BAC-18 ∥ BAC-17) → FRO-31; FRO-30 можно параллельно с BAC; затем FRO-29 / FRO-28.

Уточнение контракта при нарезке: в `ProfileTopicDto` и `FeedItemDto` добавлен **`shareId`** (клик → `/t/:shareId`).

---

## Итог закрытия (12.10.2026)

- Must MVP: Auth, Topics (CRUD + DnD + privacy), Share S09, Social (S10 + follow + S13), PWA-shell, RU UI.
- YouGile BAC/FRO — открытых карточек нет.
- **5f** / post-MVP (`ideas`, OG, rate-limit, домен, тесты…) — вне контракта; брать только явным «пересматриваем» / новой нарезкой.

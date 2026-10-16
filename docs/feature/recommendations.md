# Рекомендации (mutual recommend)

Post-MVP фича. Решения: [`../process/decisions.md`](../process/decisions.md) (17.10.2026). Идея: [`../backlog/ideas.md`](../backlog/ideas.md).

## Проблема

Лента (S13) показывает **public-топики** людей, на которых подписан. Нет способа точечно сказать «посмотри вот этот фильм/игру» конкретному кругу — без открытия private-топика и без спама всем подписчикам.

## Решение

Персональная рекомендация **элемента** взаимным подпискам + inbox «Мои рекомендации» сверху ленты. Accept = copy в inbox своего топика той же категории (как copy-from-share).

## Scope v1

| В scope | Вне scope |
|---------|-----------|
| Получатели = **взаимные** подписки (`followers ∩ following`) | Односторонние followers / following |
| Любой свой item (inbox или ranked), в т.ч. из **private**-топика | Шаринг топика целиком |
| Снимок карточки при send (title, cover, category, meta) | Deep-link в чужой private/unlisted топик |
| Блок сверху Ленты (`FeedPage`) | Отдельный таб / блок на «Мои топики» |
| Accept → picker топика той же category → copy в inbox | Push/email/realtime |
| Dismiss из inbox | Пагинация, «уже рекомендовал», списки взаимных на профиле |
| Fan-out: одна строка `Recommendation` на получателя | Групповая сущность + recipients |

## Продуктовые правила

### Кому

Только пользователи `U`, для которых одновременно:

1. `Follow(followerId=U, followingId=me)` — U подписан на меня;
2. `Follow(followerId=me, followingId=U)` — я подписан на U.

«Отправить всем» = всем из этого множества (не всем подписчикам).

Пикер UI: заголовок «Кому рекомендовать»; empty — «Пока нет взаимных подписок».

### Что

Рекомендуется **элемент**, не топик. Privacy топика-источника не ограничивает send: private ок, т.к. получатель видит только снимок.

### Что видит получатель

Снимок: title, cover (если был), category, meta (если был), `fromNick`, `createdAt`.  
Исходный топик не открывается.

### Accept / dismiss

- **Accept:** как copy-from-share — выбрать свой топик той же `category` → новый Item в inbox (title/meta + clone cover при наличии). Рекомендация → `accepted`.
- **Dismiss:** статус `dismissed`, убрать из pending-inbox.

## Модель Prisma

```prisma
enum RecommendationStatus {
  pending
  accepted
  dismissed
}

model Recommendation {
  id            String               @id @default(uuid())
  fromUserId    String
  toUserId      String
  sourceItemId  String?              // null если исходный Item удалён
  title         String
  coverKey      String?
  category      TopicCategory
  meta          Json?
  status        RecommendationStatus @default(pending)
  createdAt     DateTime             @default(now())

  fromUser User  @relation("RecommendationFrom", fields: [fromUserId], references: [id], onDelete: Cascade)
  toUser   User  @relation("RecommendationTo", fields: [toUserId], references: [id], onDelete: Cascade)
  sourceItem Item? @relation(fields: [sourceItemId], references: [id], onDelete: SetNull)

  @@index([toUserId, status, createdAt])
  @@index([fromUserId])
}
```

- При send: копируем title/coverKey/category/meta с Item (+ category топика); coverKey — тот же ключ или clone в MinIO (предпочтение реализации: **clone** при accept, на снимке можно хранить исходный `coverKey` owner’а только если storage публично читаем path-style; безопаснее **скопировать объект при send** или при accept — как в copy-from-share).
- Канон для v1 cover: при **accept** клонировать объект в новый `coverKey` получателя (как copy-from-share); в строке рекомендации хранить `coverKey` снимка отправителя **или** уже склонированный ключ «на рекомендацию» — выбрать один путь в BAC и не смешивать. Предпочтение: хранить `coverKey` исходного item до accept; при accept — clone (если объект ещё есть) / без обложки если нет.
- Повторная рекомендация той же пары `(from, to, sourceItemId)` при `pending`: идемпотентно обновить `createdAt` / no-op **или** 409 — зафиксировать в BAC: **409 Conflict** «Уже рекомендовано».
- Удаление Item: `sourceItemId → null`, снимок остаётся; accept копирует из снимка (title/meta); cover — best-effort.

## API

Префикс `/api`, AuthGuard (сессия). OpenAPI → `gen:api`.

| Метод | Путь | Суть |
|-------|------|------|
| `GET` | `/me/mutual-follows` | `{ items: [{ id, nick }] }` — пересечение follow |
| `POST` | `/items/:itemId/recommend` | body `{ recipientIds: string[] }` **или** `{ all: true }`; только owner item; каждый recipient — взаимный |
| `GET` | `/recommendations` | inbox: `status=pending`, `createdAt desc`; поля снимка + `fromNick` + `id` |
| `POST` | `/recommendations/:id/accept` | body `{ topicId }`; только `toUser` + `pending`; category match; copy → inbox; → `accepted` |
| `POST` | `/recommendations/:id/dismiss` | только `toUser` + `pending` → `dismissed` |

Ошибки (ориентир):

- item не свой / нет → 404;
- recipient не взаимный → 400;
- `all` при 0 взаимных → 400;
- accept: чужой/не pending → 404; category mismatch → 400; дедуп `sourceUrl` в целевом топике → 409 (как copy-from-share).

## UX

### S07 Item detail (свой)

Кнопка «Рекомендовать» → модалка: список взаимных (чекбоксы) + «Отправить всем» + confirm.

### Лента (`/app/feed`)

Сверху секция **«Мои рекомендации»** (если есть pending): карточки снимка + кто рекомендовал + Accept / Dismiss.  
Accept открывает picker топиков той же category (паттерн `CopyItemToTopicModal`).  
Ниже — текущая лента public-топиков без изменений контракта.

Empty секции рекомендаций: не показывать блок (или короткий empty — на усмотрение FRO; предпочтение: **блок скрыт**, если `items.length === 0`).

## Нарезка YouGile

Эпик **Recommendations** (стикер «Эпик Recommendations»).

| ID | Задача | Зависит от |
|----|--------|------------|
| **BAC-31** | Prisma `Recommendation` + enum status | — |
| **BAC-30** | `GET /me/mutual-follows` | — |
| **BAC-29** | `POST /items/:itemId/recommend` | BAC-31, BAC-30 |
| **BAC-28** | `GET /recommendations` + accept/dismiss | BAC-31, BAC-29 |
| **FRO-48** | API-клиент recommendations + mutual-follows | BAC-30, BAC-29, BAC-28 |
| **FRO-47** | Модалка «Кому рекомендовать» на S07 | FRO-48 |
| **FRO-46** | Блок «Мои рекомендации» на Ленте + accept/dismiss | FRO-48 |

Порядок: BAC-31 → BAC-30 (можно ∥) → BAC-29 → BAC-28 → FRO-48 → (FRO-47 ∥ FRO-46).

## Не делаем в v1

- Уведомления, badge в AppNav, realtime.
- Рекомендация гостю / не-mutual.
- Редактирование текста «с комментарием».
- Список взаимных на S10.
- Prefetch «уже есть в моих топиках» (см. отдельную идею copy-from-share already owned).

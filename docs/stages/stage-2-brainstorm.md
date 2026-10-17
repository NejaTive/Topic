# Этап 2 — Дизайн (Figma)

> Статус: ✅ дизайн закрыт владельцем (05.10.2026). Hi-fi MVP-срез готов; S08 — backlog; S10/S13 hi-fi — возврат на [Этап 5](stage-5-brainstorm.md). Этап 3 (стек) ✅; исполнение первого среза — [Этап 4](stage-4-brainstorm.md).


Список экранов: `[stage-1-brainstorm.md](stage-1-brainstorm.md)`.

**Figma:** Topic · `01 Wireframes` · `MOBILE 390` + `DESKTOP 1280`

---

## Цель этапа

1. ~~Дизайн-система~~ ✅ принята владельцем (03.10.2026)
2. ~~Концепт wireframes mobile + desktop~~ ✅
3. ~~High-fidelity (MVP-срез)~~ ✅ закрыт владельцем (05.10.2026); S08/S10/S13 отложены

---

## Wireframes — статус


| ID  | Экран               | Mobile | Desktop     |
| --- | ------------------- | ------ | ----------- |
| S00 | Landing             | ✅      | ✅           |
| S01 | Вход                | ✅      | ✅           |
| S02 | Регистрация         | ✅      | ✅           |
| S03 | Мои топики          | ✅      | ✅           |
| S04 | Создание топика     | ✅      | ✅           |
| S05 | Редактор топика     | ✅ стек | ✅ 2 колонки |
| S06 | Добавить элемент    | ✅      | ✅           |
| S07 | Карточка элемента   | ✅      | ✅           |
| S08 | В рейтинг (модалка) | ✅      | ✅           |
| S09 | Share-view          | ✅      | ✅           |
| S10 | Профиль             | ✅      | ✅           |
| S11 | Нет доступа         | ✅      | ✅           |
| S12 | Не найдено          | ✅      | ✅           |
| S13 | Лента               | ✅      | ✅           |


### Паттерны

- **Mobile:** floating dock bottom tabs `Лента | Мои топики | Профиль` (кроме landing/auth/share/errors) — 366×64, inset 12, radius 12, stroke `line`
- **Desktop:** floating dock topnav — 1256×64, inset 12, radius 12, stroke `line`; формы в колонке ~640; S05 = inbox  ranked
- Новый элемент → inbox; S08 = в конец / позиция N
- Share: только рейтинг

---

## Дизайн-система

> Статус: ✅ собрана и принята владельцем (03.10.2026). Hi-fi экранов в DS нет — это следующий шаг.

**Figma (канонические борды)**:


| Борд                                    | Node      | Ссылка                                                                                    |
| --------------------------------------- | --------- | ----------------------------------------------------------------------------------------- |
| **UI-Kit** (component sets)             | `23:2306` | [UI-Kit](https://www.figma.com/design/0BhRLYwJePI0NswAESD3JO/Topic?node-id=23-2306)       |
| **Colors · Light**                      | `40:1093` | [Colors Light](https://www.figma.com/design/0BhRLYwJePI0NswAESD3JO/Topic?node-id=40-1093) |
| **Colors · Dark** (exploration палитры) | `47:901`  | [Colors Dark](https://www.figma.com/design/0BhRLYwJePI0NswAESD3JO/Topic?node-id=47-901)   |


**Токены (машиночитаемо):** `[../design/tokens.json](../design/tokens.json)` — DTCG; SoT значений (`color` = dark, `colorLight` = light). В коде: `html.dark` / `html.light`. В Figma — коллекция Variables **Topic** (mode Default); Light/Dark на бордах — ещё не как dual mode Variables.

**MCP (форк TalkToFigma):** Variables read/create/set/bind; `rename_node`; `set_parent` (+ index). Нет delete Variables; Combine as variants — вручную. Детали — `.cursor/rules/design/figma-mcp-*.mdc`.

### Направление

Спокойно, современно, лично. **Dark**: charcoal `#0C0C10`, brand green `#2A6B4E`, secondary purple `#A879E6`. **Light**: нейтрали как у vue-dnd-kit docs (`#F8F9FA` / `#FFFFFF` / `#1A1A1E`), тот же brand green. Danger только для удалить/выйти. Не используем: cream+terracotta+serif, pill как дефолт, многослойные тени, emoji в UI.

### Цвета (semantic) — dark


| Токен                       | Hex                   | Роль                                         |
| --------------------------- | --------------------- | -------------------------------------------- |
| `bg`                        | `#0C0C10`             | фон страницы                                 |
| `surface`                   | `#12121A`             | поля, плотные панели                         |
| `surface-sunken`            | `#16161E`             | hover строки, cover placeholder, disabled    |
| `surface-glass` / `hover`   | surface @ 62% / 78%   | liquid-glass fill (nav, карточки, панели)    |
| `glass-line`                | white @ 12%           | обводка glass                                |
| `ink`                       | `#E4E4E7`             | основной текст                               |
| `muted`                     | `#A1A1AA`             | вторичный текст                              |
| `subtle`                    | `#71717A`             | placeholder, handle                          |
| `line`                      | `#27272A`             | границы                                      |
| `line-strong`               | `#32363F`             | границы полей, hover карточки                |
| `accent` / `accent-hover`   | `#2A6B4E` / `#347A5A` | primary (приглушённый green)                 |
| `accent-soft` / `accent-on` | `#14241C` / `#FFFFFF` | soft-well / текст на accent                  |
| `danger` / `danger-soft`    | `#F66F81` / `#2A1218` | удалить, выйти, ошибки                       |
| `warning` / `warning-soft`  | `#F9B44E` / `#2A2410` | баннер; privacy private                      |
| `success` / `success-soft`  | `#3DD68C` / `#163024` | privacy public; copy ok                      |
| `info` / `info-soft`        | `#A879E6` / `#1E1830` | privacy unlisted (purple)                    |
| `row` / `hover` / `line`    | `#14241C` / `#1A3026` / `#2A6B4E` | строки рейтинга/inbox              |
| `rank-default` / `rank-top` | `#E4E4E7` / `#2A6B4E` | номер ранга: 4+ / 1–3                        |
| `focus-ring`                | `#2A6B4E`             | 2px, зазор 2px                               |


### Цвета (semantic) — light

Нейтрали с [vue-dnd-kit docs (light)](https://zizigy.github.io/vue-dnd-kit/v2/guide/introduction); soft — пастели под light.


| Токен                       | Hex                   | Роль                                         |
| --------------------------- | --------------------- | -------------------------------------------- |
| `bg`                        | `#F8F9FA`             | фон страницы                                 |
| `surface`                   | `#FFFFFF`             | поля, плотные панели                         |
| `surface-sunken`            | `#F0F1F3`             | hover строки, cover placeholder, disabled    |
| `surface-glass` / `hover`   | surface @ 62% / 78%   | liquid-glass                                 |
| `glass-line`                | black @ 10%           | обводка glass                                |
| `ink` / `muted` / `subtle`  | `#1A1A1E` / `#52525B` / `#71717A` | текст                              |
| `line` / `line-strong`      | `#E4E4E7` / `#DDDDE3` | границы                                      |
| `accent` / `accent-hover`   | `#2A6B4E` / `#347A5A` | тот же brand                                 |
| `accent-soft` / soft-hover  | `#E8F5EF` / `#D4EDE0` | soft-well                                    |
| `danger-soft`               | `#FCE8EB`             | soft destructive                             |
| `warning-soft` / hover      | `#FEF6E0` / `#F5EDC8` | privacy private soft                         |
| `success-soft` / hover      | `#E6F7EF` / `#D4F0E4` | privacy public soft                          |
| `info-soft` / hover         | `#F0EAFB` / `#E4DAF7` | privacy unlisted soft                        |
| `row` / `hover`             | `#E8F5EF` / `#D4EDE0` | строки рейтинга/inbox                        |
| `rank-default`              | `#1A1A1E`             | номер ранга 4+                               |


### Типографика

Шрифты: **Onest** (400 / 500 / 600 / 700) — бренд и UI; **JetBrains Mono** Medium — только номер ранга. Serif / «книжные» стили не используем.


| Роль                     | Размер / line-height  | Вес                 | Letter-spacing |
| ------------------------ | --------------------- | ------------------- | -------------- |
| display                  | 40 / 48               | Bold                | −0.8           |
| h1                       | 32 / 40               | Bold                | −0.5           |
| h2                       | 24 / 32               | SemiBold            | −0.3           |
| h3                       | 20 / 28               | SemiBold            | —              |
| title                    | 17 / 24               | SemiBold            | —              |
| body                     | 16 / 24               | Regular             | —              |
| body-sm                  | 14 / 20               | Regular             | —              |
| label                    | 15 / 20               | SemiBold            | —              |
| caption                  | 12 / 16               | Medium              | —              |
| overline                 | 11 / 16               | SemiBold, uppercase | +0.66          |
| rank-l / rank-m / rank-s | 28/32 · 20/24 · 14/20 | Mono Medium         | —              |


### Радиусы, тень, glass

- **Spacing в Variables / tokens не держим** — отступы в макете числом, без `space/`*.
- **Радиусы:** `sm` 4 (chip, cover) · `md` 8 (кнопки, поля, строки) · `lg` 12 (карточки, модалка). Pill не используем.
- **Контролы:** `md` 44 px (touch), `sm` 32 px.
- **Тень:** одна — `shadow/float` = `0 4 16`, `#000000` @ 40%. Модалка, dragging-строка, floating docks.
- **Liquid-glass:** утилита `glass` — `surface-glass` + `backdrop-filter` blur `20px` saturate 1.15 + `glass-line`. Nav docks, TopicRow, EmptyState, auth-карточки, editor panels (md+). Инпуты / RankRow / secondary-кнопки — без glass. Без blur — непрозрачный `surface`.
- **DnD drop-slot:** открытая щель (source + insert) — `row` @ 55% на `bg`, dashed `row-line`.

### Privacy chip


| Значение | Подпись в UI | Фон / текст                         | Selected              | Иконка |
| -------- | ------------ | ----------------------------------- | --------------------- | ------ |
| private  | Приватный    | `warning-soft` / `warning`          | + обводка `warning`   | замок  |
| unlisted | По ссылке    | `info-soft` / `info`                | + обводка `info`      | ссылка |
| public   | Публичный    | `success-soft` / `success`          | + обводка `success`   | глобус |


Различаем иконкой, подписью и смысловым цветом; selected = тот же fill + цветная обводка.

### Компоненты (UI-Kit `23:2306`)


| Секция                     | Состав                                                                                                                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 04.1 Button                | Primary / Secondary / Ghost / Danger / Danger ghost × default · hover · focus · disabled; Small (32)                                                                                 |
| 04.2 Input & Textarea      | default · hover · focus · filled · error · disabled; textarea default · focus                                                                                                        |
| 04.3 Privacy chip & Banner | 3 chip; warning-баннер «Топик изменился» (Flow E)                                                                                                                                    |
| 04.4 Rank row              | default · top-3 · hover · focus · dragging · drop indicator · с кнопками ↑↓ («позиция N») · mobile 358                                                                               |
| 04.5 Topic row & card      | row (список «Мои топики») и card (лента) × default · hover                                                                                                                           |
| 04.6 Navigation            | Floating dock: bottom tab 366×64 и top nav 1256×64 (inset 12, radius 12, stroke `line`; активная иконка — soft-well 32×32 `accent-soft`; по 2 активных варианта); состояния nav link |
| 04.7 Cover upload          | empty · hover/drag-over · filled · error                                                                                                                                             |
| 04.8 Empty state           | с CTA / без CTA                                                                                                                                                                      |
| 04.9 Modal                 | `TApproveModal`: desktop 480 на scrim; mobile bottom sheet 390; destructive confirm (удалить / выйти)                                                                                |
| 05 Usage rules             | Do / Don't; именование и передача                                                                                                                                                    |


### Известные допущения

- Pressed = hover (отдельного цвета нет).
- Иконки — геометрические placeholder’ы; финальный набор не выбран.
- В cover upload лимит «до 5 МБ» и форматы — placeholder до техрешения.
- Тексты в образцах (кроме взятых из stage-1) — примеры, не контракт копирайта.

---

## Открытые вопросы

- Финальное русское имя сущности в топике (сейчас временно «элемент»; англ. `Item` без изменений).

---

## Следующий шаг

Дизайн **закрыт**. Стек: [Этап 3](stage-3-brainstorm.md). Задачи: [Этап 4](stage-4-brainstorm.md).
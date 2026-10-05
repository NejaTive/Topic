# Этап 2 — Дизайн (Figma)

> Статус: ✅ дизайн закрыт владельцем (05.10.2026). Hi-fi MVP-срез готов; S08/S10/S13 — backlog. Этап 3 (стек) ✅; дальше — [Этап 4](stage-4-brainstorm.md).


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


**Токены (машиночитаемо):** `[../design/tokens.json](../design/tokens.json)` — DTCG; SoT значений. В Figma — коллекция Variables **Topic** (mode Default). Dark пока на слайде `47:901`, не как отдельный mode Variables.

**MCP (форк TalkToFigma):** Variables read/create/set/bind; `rename_node`; `set_parent` (+ index). Нет delete Variables; Combine as variants — вручную. Детали — `.cursor/rules/design/figma-mcp-*.mdc`.

### Направление

Спокойно, современно, лично. Light. Deep teal, off-white фон. Не используем: purple/indigo glow, cream+terracotta+serif, dark-by-default, pill как дефолт, многослойные тени, emoji в UI.

### Цвета (semantic)


| Токен                       | Hex                   | Роль                                         |
| --------------------------- | --------------------- | -------------------------------------------- |
| `bg`                        | `#F6F7F5`             | фон страницы                                 |
| `surface`                   | `#FFFFFF`             | карточки, строки, поля                       |
| `surface-sunken`            | `#EDF0ED`             | hover строки, cover placeholder, disabled    |
| `ink`                       | `#16201E`             | основной текст                               |
| `muted`                     | `#5B6865`             | вторичный текст                              |
| `subtle`                    | `#8A9693`             | placeholder, handle                          |
| `line`                      | `#DDE3E0`             | границы                                      |
| `line-strong`               | `#C3CCC8`             | границы полей, hover карточки                |
| `accent` / `accent-hover`   | `#0F6B5C` / `#0B574B` | primary, ссылки, активный пункт              |
| `accent-soft` / `accent-on` | `#E2F0EC` / `#FFFFFF` | фон chip public, drag-over / текст на accent |
| `danger` / `danger-soft`    | `#B3342B` / `#FBEAE8` | ошибки, удаление                             |
| `warning` / `warning-soft`  | `#8A5A00` / `#FBF1DC` | баннер «Топик изменился»                     |
| `info` / `info-soft`        | `#2F4A68` / `#E8EEF5` | chip unlisted                                |
| `rank-default` / `rank-top` | `#16201E` / `#0F6B5C` | номер ранга: 4+ / 1–3                        |
| `focus-ring`                | `#0F6B5C`             | 2px, зазор 2px                               |


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


### Радиусы, тень

- **Spacing в Variables / tokens не держим** — отступы в макете числом, без `space/`*.
- **Радиусы:** `sm` 4 (chip, cover) · `md` 8 (кнопки, поля, строки) · `lg` 12 (карточки, модалка). Pill не используем.
- **Контролы:** `md` 44 px (touch), `sm` 32 px.
- **Тень:** одна — `shadow/float` = `0 4 16`, `#16201E` @ 8%. Только модалка и dragging-строка. Карточки и строки — граница `line`.

### Privacy chip


| Значение | Подпись в UI | Фон / текст            | Иконка |
| -------- | ------------ | ---------------------- | ------ |
| private  | Приватный    | surface-sunken / muted | замок  |
| unlisted | По ссылке    | info-soft / info       | ссылка |
| public   | Публичный    | accent-soft / accent   | глобус |


Различаем иконкой и подписью, не только цветом.

### Компоненты (UI-Kit `23:2306`)


| Секция                     | Состав                                                                                                                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 04.1 Button                | Primary / Secondary / Ghost / Danger ghost × default · hover · focus · disabled; Small (32)                                                                                          |
| 04.2 Input & Textarea      | default · hover · focus · filled · error · disabled; textarea default · focus                                                                                                        |
| 04.3 Privacy chip & Banner | 3 chip; warning-баннер «Топик изменился» (Flow E)                                                                                                                                    |
| 04.4 Rank row              | default · top-3 · hover · focus · dragging · drop indicator · с кнопками ↑↓ («позиция N») · mobile 358                                                                               |
| 04.5 Topic row & card      | row (список «Мои топики») и card (лента) × default · hover                                                                                                                           |
| 04.6 Navigation            | Floating dock: bottom tab 366×64 и top nav 1256×64 (inset 12, radius 12, stroke `line`; активная иконка — soft-well 32×32 `accent-soft`; по 2 активных варианта); состояния nav link |
| 04.7 Cover upload          | empty · hover/drag-over · filled · error                                                                                                                                             |
| 04.8 Empty state           | с CTA / без CTA                                                                                                                                                                      |
| 04.9 Modal                 | desktop 480 на scrim; mobile bottom sheet 390                                                                                                                                        |
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
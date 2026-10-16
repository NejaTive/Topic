# Решения и договорённости

Краткий лог устойчивых решений. Сырой диалог не храним.

Формат: день целиком (`ДД.ММ.ГГГГ`), внутри — темы со списками. Новые записи того же дня дописываем в тот же блок.

---

## 03.10.2026

### Правила агента на проекте

- Коммуникацию/решения сохраняем в `docs/process/decisions.md` **и** в agent/personal stores.
- В лог — только решения и договорённости; язык записей — русский.
- Когда фиксировать: агент решает сам; при сомнении спрашивает.
- `docs/` — источник истины; менять зафиксированное только после явного «пересматриваем».
- Порядок этапов (0→1→…) пока не жёстко регламентируем.
- Коммиты и push — только по запросу/команде.
- UI-язык, стек, архитектура, тесты, дизайн-код — в rules пока не описываем.
- Ответы агента — на русском; большие изменения — план + OK; вопросы — умеренно; для реализации — варианты, при сомнении — вопрос.
- Секреты / `.env` — только после спроса.
- После ответа агент даёт 1–2 коротких тейка: что дальше требуется от владельца (решить / подтвердить / сделать).

### Структура rules

- Правила агента лежат в `.cursor/rules/collaboration/` (не `communication`: туда ещё docs, git, секреты).
- Файлы: `persist-decisions.mdc`, `docs-source-of-truth.mdc`, `working-style.mdc`, `owner-level.mdc`.

### Уровень владельца проекта

- Владелец — опытный full-stack; **не** новичок и не «учится стеку с нуля».
- «Потрогать технологии» = осознанный выбор/практика стека на pet, не ученический онбординг.
- Тон агента: trade-offs и архитектура; без упрощений и формулировок «для обучения / новичка».
- Риск scope формулировать как product/priority creep, не как «не потянет технологии».

### Документ идей

- Черновые мысли и будущие фичи складываем в [`docs/backlog/ideas.md`](../backlog/ideas.md) (мини-todo / inbox идей).
- Это не замена MoSCoW и не контракт MVP; промоут в scope — отдельным решением.

### Этап 0 — продукт

- Этап 0: **без** углубления в архитектуру (репо, Nest, деплой, хранение рангов) — отдельный тех-разговор.
- Приватность топика: **private / unlisted / public**; дефолт нового топика — **unlisted**.
- Элемент топика в MVP: без статуса; только **ещё не оценён** / **оценён**. (Русское имя временно «элемент»; финальный термин — открытый вопрос. Англ. сущность в модели пока `Item`.)
- Пометки вроде прохожу / прошёл / забросил — позже через **теги** (`docs/backlog/ideas.md`).
- Даты элемента: в MVP только **дата добавления** (система). **Дата потребления** — отложена, см. `docs/backlog/ideas.md` *(ранее: обе даты; 04.10.2026 — потребление вынесено из MVP)*.
- Профиль MVP: **ник + public-топики** (без био/аватара).
- Сроки / формальный критерий успеха MVP: **не фиксируем**.
- Рабочее имя концепции: **Topic**.
- Онбординг — в `docs/backlog/ideas.md`, не Must MVP.
- Конфликт правок с двух устройств: продуктово не молча overwrite; UX «топик изменился — обновить». Техника — позже.
- Митигации: лимиты upload (продуктово), a11y-альтернатива DnD, отдельная страница для шаринга — приняты.

### Трекер этапов

- Ход по этапам MVP ведём в [`docs/process/stages-todo.md`](stages-todo.md) (что закрыто / в работе / дальше).
- Формат чекбоксов: `[ ]` / `[~]` / `[x]`; детали не копировать сюда целиком.

### Структура docs/

- `docs/process/` — решения, трекер этапов
- `docs/stages/` — документы этапов (`stage-0-brainstorm.md` … `stage-3-brainstorm.md`)
- `docs/backlog/` — идеи и черновые заметки
- Именование: `stage-N-brainstorm.md`; заготовки 1–3 созданы заранее.

### Этап 1 — старт

- Этап 1 в работе: [`docs/stages/stage-1-brainstorm.md`](../stages/stage-1-brainstorm.md) (sitemap, flows, модель данных).
- Закрытие этапа — после фидбэка владельца.

### Этап 1 — фидбэк (дополнения)

- В MVP включена **лента друзей**: подписка с профиля + лента **public**-топиков друзей (не activity на каждый DnD).
- Лендинг (S00) — да.
- На share-странице inbox **скрыт** (только рейтинг).
- `consumedAt` — **не в MVP**; см. `docs/backlog/ideas.md` *(ранее: опционально; 04.10.2026 — вынесено)*.
- Ник: **только латиница** (`a–z`, цифры, `_`); unique case-insensitive.
- Пресет задаётся только при создании топика.

### Этап 1 — закрыт

- Этап 1 ✅ 03.10.2026: sitemap, flows, модель данных приняты (см. `stage-1-brainstorm.md`).
- Ник: только латиница.
- Следующее: Этап 2 — дизайн.

### Этап 2 — старт

- Этап 2 🔄: Figma wireframes mobile + desktop; MCP подключён.
- **Mobile nav:** floating dock bottom tabs (Лента / Мои топики / Профиль); desktop — floating dock topnav.
- Lo-fi концепция **добита** (S00–S13 оба брейкпоинта). Hi-fi/DS — после OK.
- Создание топика: не «выбор пресета», а **подсказки к названию** (Фильмы/Сериалы/…); в будущем — категории. Записано в IA + Figma S04.
- Lo-fi концепция **принята** владельцем (03.10.2026).

### Этап 2 — дизайн-система (решения)

- ~~Figma: отдельная страница `02 Design System`~~ — **отменено 05.10.2026:** страница DS будет удалена; канон перенесён на борды рядом с hi-fi (см. блок 05.10 ниже и `stage-2-brainstorm.md`).
- Шрифты: **Onest** — и display/бренд, и UI (serif / «книжный» стиль **не** используем); **JetBrains Mono** — только номер ранга.
- Палитра: light, deep teal `#0F6B5C`, фон off-white `#F6F7F5`; privacy-чипы различаем иконкой+подписью, не только цветом.
- Радиусы 4/8/12, pill не используем; одна тень `shadow-float` (только модалка и dragging-строка); карточки и строки — на границах `line`.
- Токены: форма **A + B** — образцы в Figma + таблица в `stage-2-brainstorm.md` + `docs/design/tokens.json` (для импорта в Figma Variables плагином; не кодовый артефакт).
- Ограничение моста: нет Variables / Styles / Components API — в Figma токены и компоненты это именованные образцы-фреймы; превращение в Components вручную. *(часть про Variables устарела после форка TalkToFigma — см. 05.10.)*
- ~~DS собрана на странице `02 Design System` (секции 00–05)~~ — **отменено 05.10:** SoT в Figma = UI-Kit + Colors Light/Dark.
- **Ревью DS принято** владельцем (03.10.2026).
- Подписи privacy-чипов в UI: Приватный / По ссылке / Публичный.
- Pressed = hover; иконки — геометрические placeholder’ы; лимит cover «до 5 МБ» — placeholder до техрешения.

### Терминология продукта

- Русское имя сущности в топике: временно **«элемент»** вместо «айтем» (UI и docs).
- Финальный термин — **открытый вопрос** (вернуться позже).
- Англ. идентификатор в модели/роутах пока без изменений: `Item`, `/items/`, `itemId`.

### Этап 2 — редизайн Auth (hi-fi)

- Новый фрейм `Auth / Redesign` рядом с `Auth` (`18:31`); исходный фрейм не трогаем.
- Направление **A**: тот же стиль и токены DS (Onest, `#0F6B5C`, `#F6F7F5`), чище иерархия и плотнее композиция; без split-экрана и без смены бренда.
- `redirect-hint` («После входа → Мои топики (S03)») из UI **убираем** — это заметка для разработки.
- Объём: S00–S02, mobile 390 + desktop 1280, состояния default / focus / error (как в исходнике).
- Сделано в Figma (клон `Auth` → `Auth / Redesign`, id `18:318`): форма — белая карточка (border `line`, radius 12, mobile 358 / desktop 440), поля выровнены по одной левой границе (убран внутренний padding 10), ссылка-футер — серый текст как в v1 (не outline-кнопка); отступы: между инпутами 20, между primary и ссылкой 12; S00: бренд в акценте, кнопки одной ширины на desktop.
- Ограничения моста: нельзя менять шрифт/размер, переименовывать слои и переносить между родителями — desktop-экраны S01/S02 собраны клонами mobile, слои остались с именем «M S01 / Default» (переименовать вручную).
- Старый фрейм `Auth` (`18:31`) **удалён**; на странице остался только редизайн (`18:318`, заголовок внутри «Auth / Redesign»), сдвинут на место старого.
- **Hi-fi Auth (S00–S02) принят** владельцем (03.10.2026). Паттерн секции на `03 Production-ready design`: блок по flow, M+D, состояния default/focus/error; lo-fi = IA, DS = визуал.
- Следующий срез hi-fi: **`App · Topics`** (план A) — S03 / S04 / S05, M+D; S03 empty; S05 desktop 2 колонки.

### App · Topics — навигация (hi-fi)

- Выбран стиль **B · Floating dock** для mobile bottom tab и desktop topnav.
- Mobile: dock 366×64, inset 12 от краёв экрана, radius 12, stroke `line`; без full-bleed hairline.
- Desktop: dock 1256×64, inset 12, radius 12, stroke `line`; без underline у активного пункта (актив = accent + SemiBold).
- Активная иконка mobile: soft-well 32×32, fill `accent-soft`, radius 8 (фича из варианта A).
- Образцы обновлены в DS `04.6 / Navigation`; exploration-фреймы A/B/C (**не** удалять) оставлены рядом с доской вариантов.

### App · Topics — Topic row (hi-fi)

- Выбран паттерн **B · DS row**: топ-3 cover (32×40) + title + meta + privacy chip.
- Meta в row: **название + дата последнего редактирования** (счётчик элементов в row не обязателен).
- Privacy chip — **responsive split**:
  - **mobile** (~358): только icon-chip 24 (глаз/ссылка/замок) — подпись не влезает рядом с 3 cover;
  - **desktop** (шире): chip с иконкой + подписью (`Публичный` / `По ссылке` / `Приватный`).
- Exploration: `topic-row · style exploration` — mobile B + desktop labeled sample; варианты A/C оставить.
- Desktop Topic row: три компонента privacy (Unlisted / Public / Private) — объединить вручную в variant set `Privacy` (MCP не умеет Combine as variants). Mobile — icon-only; desktop — icon + подпись.

## 04.10.2026

### App · Topics — S05 header meta (hi-fi)

- Под заголовком топика — ряд `meta` (358, SPACE_BETWEEN): privacy chip слева + Danger ghost «Удалить топик» справа.
- На M/D S05 meta:
  - всегда: privacy chip + «Удалить топик» (SPACE_BETWEEN);
  - mobile Unlisted: иконка copy (24) рядом с чипом; текстовой «Скопировать ссылку» нет;
  - desktop Unlisted: пока Ghost «Скопировать ссылку» рядом с чипом;
  - Public — без copy.
- Клоны `39:680` / `39:698` = стейт Unlisted; основные `21:896` / `21:897` = Публичный.
- D S05: 2 колонки inbox | ranked; back «← Мои топики».

### App · Topics — S06 Добавить элемент (hi-fi)

- M+D в `App · Topics` под рядом S05: `40:1972` / `40:1992` (имена слоёв пока клон S04 — переименовать в `M/D S06 / Default`).
- Паттерн как S04: back → title → subtitle → поля → Primary CTA; Input/Button/Nav из UI-Kit.
- Copy: back «← Фильмы»; title «Добавить элемент»; subtitle «Попадёт в «Ещё не оценены»»; CTA «Добавить»; термин **элемент** (docs), не «айтем».
- Поля: Название * · Cover upload instance Empty 144×192 (`40:3050` из set `40:3054`). Дата потребления — не на экране (отложено в backlog).
- Один default-state; hover/error cover — только в DS, не на экране.

### App · Topics — S07 Карточка элемента (hi-fi)

- M+D в `App · Topics` под S06: `40:2158` / `40:2174` (переименовать в `M/D S07 / Default`).
- Стейт **inbox** (ещё не оценён): Cover upload instance Filled (`40:3052`) + «Заменить», Input Filled «Dune 2», meta «Добавлен» + placement, CTA: Primary «Сохранить» · Danger ghost «Удалить».
- Без даты потребления (как S06).
- Wireframes S07: строка «Потребление» убрана.

### Cover upload — component set в hi-fi

- Set `40:3054` (Empty / Hover / Filled / Error); в S06/S07 стоят **instances**, не копии фреймов DS.

## 05.10.2026

### Figma Variables — коллекция Topic

- Старые коллекции (`Collection 1` / `Colors` / `Effects`) удалены владельцем.
- Создана коллекция **Topic** (`VariableCollectionId:44:845`, mode `Default`) из `docs/design/tokens.json`.
- Типы: COLOR (`color/*`, `focus/ring`) · FLOAT (`radius/*`, `size/*`) · STRING (`font/family/*`).
- Не перенесены: `shadow/float`, composite `typography/*` (нет прямого типа в Variables).
- **`space/*` убраны** из `tokens.json` / stage-2 (05.10): отступы не токенизируем в Variables. В Figma удалить `space/1…11` вручную (MCP delete нет).
- Batch-bind `cornerRadius` → `radius/sm|md|lg` (4/8/12) на hi-fi + UI-Kit + DS; **559** узлов, fail 0. Декор/иконки (1–2.75, 5, 10, 16, 999) не трогали.
- Слайд **`06 / Icons`** (`49:1112`) справа от UI-Kit: каталог геометрических placeholder-иконок (lock/globe/link, nav-feed/topics/profile, plus/copy, handle, empty) + слоты back/trash/check/close/search/warning. Components — вручную владельцем, затем instances по проекту.
- **Отменено:** слайд Icons убран владельцем (05.10) — иконки пока не каталогизируем отдельно.
- Слайд **UI-Kit** (`23:2306`): оформлен как DS-борд — header `03 · UI-KIT`, секции `04.x`, сетка component sets (pad 48 / gap 40 / col-gap 32), crop `1526×2688`, fill `color/bg`. Порядок сверху вниз: Nav → Topic row → Privacy/Main chip → Input → Button → Rank → Cover (номера секций = DS, не визуальный порядок).
- **Канон Figma DS (05.10):** страница `02 Design System` **будет удалена**. Живые артефакты:
  - UI-Kit / components: [`23:2306`](https://www.figma.com/design/0BhRLYwJePI0NswAESD3JO/Topic?node-id=23-2306)
  - Colors Light: [`40:1093`](https://www.figma.com/design/0BhRLYwJePI0NswAESD3JO/Topic?node-id=40-1093)
  - Colors Dark (exploration): [`47:901`](https://www.figma.com/design/0BhRLYwJePI0NswAESD3JO/Topic?node-id=47-901)
  - Значения токенов: `docs/design/tokens.json` + Variables Topic; факты — `stage-2-brainstorm.md`.
- Форк TalkToFigma: чтение/создание/bind Variables работает; delete Variables API в форке пока нет.
- Rules обновлены: `.cursor/rules/design/figma-mcp-workflow.mdc`, `figma-mcp-limits.mdc` под форк (Variables, `rename_node`, `set_parent`+index, локальный плагин).
- **Отменено** из записей 03.10 про мост: «нет Variables / rename / reparent» — устарело после форка (05.10.2026). Combine as variants по-прежнему вручную.
- Скан hi-fi (`17:30`): семантически не хватало только **chip hover** (#D4E0EF, #CFE6DF, #F0E0B8) — добавлены в Topic и `docs/design/tokens.json`:
  - `color/info/hover` · `color/accent/soft-hover` · `color/warning/hover`.
- На `01 / Colors` (`40:1093`): секция **CHIP HOVER**, swatch с bind; UI-Kit: privacy chip hover + Main chip Hover/Selected привязаны к этим переменным.
- Wireframe-hex в exploration (#111, #666, …) **не** в Topic без отдельного решения.
- Batch-bind colors → Topic Variables на hi-fi + DS (не exploration): App · Topics, Auth, UI-Kit, доски `00–05` в Other Pages; **1358** fills/strokes. Exploration S* под Other Pages не трогали.
- Правило Figma: цвета **только** через Variables Topic; новый цвет — спросить → добавить в Variables + `tokens.json` → потом использовать (`figma-mcp-workflow.mdc`).
- Batch-bind `fontFamily` → `font/family/sans` (Onest, вкл. бывший Inter) / `font/family/mono` (JetBrains Mono) на hi-fi + UI-Kit + DS `00–05`; **877** текстов, fail 0. Exploration не трогали.
- Правило Figma: шрифты **только** через Variables; новый family — спросить → STRING в Topic + `tokens.json` → bind.

### S08 — не делаем в текущем hi-fi

- Отдельный экран/модалка S08 («в конец» / позиция N) **отложена** → `docs/backlog/ideas.md`.
- Перенос inbox → ranked пока: DnD на S05 + «В рейтинг» с дефолтом **в конец** (без модалки).

### App · Share — S09 Share-view (hi-fi)

- M+D в `App · Topics`: `40:2344` / `40:2345`.
- Read-only рейтинг по `/t/:shareId`; inbox скрыт; без owner app-nav (M без bottom tabs).
- Header: `@alice` + «Игры» + Privacy Public; список 5× Rank row (игры).
- Desktop guest chrome: floating «Topic» + Primary «Войти».
- Mobile guest chrome: floating bottom dock `Navigation GUEST MOBILE` + Primary «Войти» (как D, без owner tabs).
- DnD-handle на instances Rank row MCP не удаляет — при желании Detach и убрать вручную.

### App · Topics — S11 / S12 error states (hi-fi)

- M/D S11 `40:2882` / `40:2915`: «Нет доступа» + «Топик private или ссылка недоступна»; guest chrome Topic + Primary «На главную».
- M/D S12 `40:2953` / `40:2986`: «Не найдено» + «Битая ссылка или топик удалён»; тот же chrome.
- Центрированный empty-state; без owner tabs; слои пока клон S09 — переименовать в `M/D S11|S12 / Default`.

### S13 — не делаем в текущем hi-fi

- Экран ленты друзей (S13) **отложен** → `docs/backlog/ideas.md`.
- Продуктовое решение stage-1 про подписку+ленту **не отменяем** — только макет S13 сейчас не делаем.
- Tab «Лента» в nav на уже собранных экранах пока не трогаем.

### S10 — не делаем в текущем hi-fi

- Экран публичного профиля (S10) **отложен** → `docs/backlog/ideas.md`.
- Продуктовое решение stage-1 про профиль+подписку **не отменяем** — только макет S10 сейчас не делаем.
- Tab «Профиль» в nav на уже собранных экранах пока не трогаем.

### Этап 2 — закрытие дизайна

- Владелец: **дизайн закончен** (05.10.2026).
- Hi-fi MVP-срез: Auth S00–S02; Topics S03–S07; Share S09; errors S11–S12; UI-Kit + Colors Light/Dark.
- Вне текущего hi-fi (backlog): S08, S10, S13.
- Следующий этап: **Этап 3** — сначала **выбор стека и технологий** (Plan mode), затем спринты/AC/структура репо. _(Этап 3 закрыт 05.10.2026; спринты/задачи перенесены на Этап 4.)_

### Этап 3 — стек

Подробности и обоснования — [`stage-3-brainstorm.md`](../stages/stage-3-brainstorm.md) §0.

- Выбран **вариант A**: Vue 3 SPA (Vite) + Nest REST + Postgres. Отклонены: B (Nuxt hybrid SSR), C (BaaS без Nest).
- Frontend: Vue 3, TS, Router, TanStack Vue Query + Pinia (только сессия), **Tailwind v4** (токены из `tokens.json` как CSS-переменные), без i18n и компонент-либы, нативный простой DnD (библиотека — по ходу). PWA — `vite-plugin-pwa`.
- Backend: Nest REST, OpenAPI → `openapi-typescript` / `openapi-fetch`, `class-validator`.
- БД: Postgres + **Prisma**; ранги — плотный `rankPosition` 1…N, `move` одной транзакцией.
- Auth: argon2, opaque-сессия в БД, httpOnly cookie `SameSite=Lax`, фронт и API на одном сайте.
- Обложки: multipart через Nest (5 МБ), `sharp` → webp, S3-совместимое хранилище (MinIO в dev), случайные ключи; **риск принят:** обложки private-топиков защищены только неугадываемым URL.
- **Моно-репо** (pnpm workspaces: `apps/web`, `apps/api`, `docs/`), Nest — отдельный деплоимый контур. **Пересматриваем** stage-0 п.20 («отдельный repo») — решение владельца.
- Отложено в реализации (продуктовые договорённости в stage-0/1 **не отменены**, вернуться явно; записи в `docs/backlog/ideas.md`):
  - ↑↓ / «переместить на позицию N» как альтернатива DnD (a11y);
  - UX «Топик изменился» + optimistic-проверка версии (до этого возможен тихий overwrite порядка).
- Также не решено / позже: OG-превью (отдельный slice), **тесты** (владелец: делаем отдельно, не добавляем сейчас), ~~prod-хостинг и prod-хранилище~~ (закрыто 08.10.2026), rate-limit на auth, способ подключения токенов в Tailwind.
- ~~В `.cursor/rules/` стек не фиксируем (до отдельного OK).~~ — **отменено 05.10.2026:** владелец дал OK, стек зафиксирован в `.cursor/rules/engineering/tech-stack.mdc` (always-apply; docs остаются SoT). Архитектура/структура папок и дизайн-код-правила в rules по-прежнему не описываются.
  - Пометка к записи 03.10 («UI-язык, стек, архитектура, тесты, дизайн-код — в rules пока не описываем»): для **стека** устарело.

### Этап 3 — закрытие

- Этап 3 ✅ **05.10.2026**: цель этапа — только выбор и фиксация стека (`stage-3-brainstorm.md` §0, `tech-stack.mdc`).
- Спринты, AC, нарезка MVP — **не** этап 3; перенесены на **Этап 4**.

### Этап 4 — задачи, YouGile, agent-workflow (старт)

Документ: [`stage-4-brainstorm.md`](../stages/stage-4-brainstorm.md).

- **Разделение SoT:** продукт и устойчивые решения — `docs/`; **задачи, статусы, AC исполнения** — **YouGile** (полный бэклог в markdown **не** зеркалим).
- **История выполнения** задач с доски — текстовый лог [`docs/process/task-history.md`](task-history.md) (пишет ревьюер при OK, до merge; см. 4e ниже).
- **Структура репо (корень):** `docs/`, `apps/web/`, `apps/api/`; опционально `apps/web/docs`, `apps/api/docs`. Внутренняя архитектура приложений — через карточки YouGile, не заранее в stage-доках.
- **YouGile:** компания создана; колонки/задачи — через **MCP** в отдельном чате. MCP: `https://yougile.com/data/ai/mcp`, `Authorization: Bearer …` — как на соседнем проекте; ключ **только локально**, не в репо.
- **Agent-workflow** — зафиксирован в фазе **4e** (см. ниже); канон в [`stage-4-brainstorm.md`](../stages/stage-4-brainstorm.md).
- Фаза **4a** (docs этапа 3/4 + task-history) — выполнена 05.10.2026; дальше **4b** — подключение MCP.

### YouGile — структура досок (4b–4c, старт)

- **MCP** подключён (`project-0-topic-yougile`), сессия через открытую вкладку компании **Topic**.
- **Проекты:** `Frontend` (префикс `FRO`), `Backend` (префикс `BAC`).
- В каждом проекте доска **«Задачи»** (актуальные id: Frontend `fb18e6e8-…`, Backend `d55d6a0a-…`).
- **Колонки** (RU, одинаковые): `Бэклог` → `К работе` → `В разработке` → `На проверке` → `Готово`.
  - Было EN (`Backlog`/`Ready`/`Doing`/`Review`/`Done`) — отменено; старые EN-доски удалить вручную в YouGile (MCP rename/delete колонок нет).
- Стикеры — см. «YouGile — стикеры» ниже.
- Slice — не заводим.

### YouGile — стикеры (4c, ✅ 05.10.2026)

- На досках **Задачи** (Frontend `fb18e6e8-…`, Backend `d55d6a0a-…`):
  - **`Эпик`** (`string`): `Scaffold`, `Auth`, `Topics`, `Share`, `Page Error` (S11–S12).
  - **`Errors`** (`string`) — тип дефекта/правки (не эпик; **не** путать с эпиком Page Error). Одно значение на карточку:
    - `Bug` — сломано поведение / контракт API;
    - `UI` — визуал, отступы, токены, курсор, декоративные ссылки;
    - `UX` — флоу / валидация «как ощущается», без «сломано напрочь»;
    - `A11y` — доступность;
    - `Perf` — производительность, лишние запросы;
    - `Copy` — тексты / лейблы / сообщения (если не валить в UX).
- S08 / S10 / S13 — вне MVP-среза, значений эпика нет.
- «Первые эпики» как карточки-родители — не заводили; эпик = стикер на задачах (4d).

### YouGile — Errors taxonomy (уточнение 07.10.2026)

- Расширен список значений **Errors** (см. блок стикеров выше). Git-тип ветки (`fix/…`) ≠ эпик; при `fix` на карточке ставить подходящее **Errors**.
- MCP `create_sticker` **не дописывает** values к существующему стикеру — создаёт дубликат (`Errors (2)` / `(3)`). Канон после ручной зачистки: один стикер **Errors** с полным набором на каждой доске; старые урезанные Errors — удалить в UI YouGile, новый переименовать в `Errors`.
- **FRO-21:** Эпик `Auth`; Errors — `UX` (валидация) + временно `UI` на старом дубликате стикера до зачистки.

### Git-хостинг (отмена GitLab → GitHub)

- **GitLab отменён** для Topic: на используемом тарифе нет PAT / access token в нужном виде; официальный GitLab MCP и `@zereight/mcp-gitlab` **не подключаем**.
- **GitHub** — выбранный хост для репозитория проекта.
- **GitHub MCP:** официальный [github/github-mcp-server](https://github.com/github/github-mcp-server), remote `https://api.githubcopilot.com/mcp/` в `.cursor/mcp.json`; PAT в **`GITHUB_PAT`** (env, не в репо). Плагин Cursor **GitHub** — опционально; не дублировать второй сервер с тем же именем.
- Локальный `git` + remote — для push; MCP — issues/PR/repos из чата.
- Remote: **https://github.com/NejaTive/Topic** (private); локальный `origin` — **SSH** (`git@github.com:NejaTive/Topic.git`).
- Каталог **`.cursor/` целиком** — не в git (секреты MCP, локальные settings/rules для Cursor).
- Сообщения **git commit** — на **русском**; по задаче YouGile — `тип(ID): суть` (см. 4e / уточнение ниже); вне задачи — `тип: суть`.
- ~~Ветки — пока только `main`.~~ — **отменено 05.10.2026 (4e):** база фич — `develop`; см. блок «Этап 4e» ниже.
- Правило агента: `.cursor/rules/collaboration/git.mdc` (always-apply); в `working-style.mdc` — ссылка + политика `.env`.

### Share — продуктовые уточнения (нарезка 4d)

- ~~Guest chrome на S09: Primary «Войти» → `/login`; Ghost «Присоединиться» → `/`.~~ — **отменено 07.10.2026** (см. блок «S09 header»).
- Владелец на своём unlisted/public `/t/:shareId` остаётся на **S09** (preview), без redirect на S05; CTA «Редактировать» на S09 не делаем в этом эпике.
- Share API: **403** (private / недоступен) отдельно от **404** (нет / удалён) — под экраны S11 / S12.
- Карточки YouGile: **BAC-13**, **FRO-18**, **FRO-19** (эпик Share); S11–S12 — эпик Page Error.

### Page Error — нарезка 4d

- Одна карточка **FRO-20** (S11 + S12); стикер **Page Error**.
- S11 subtitle: **«Ссылка недоступна»** (title «Нет доступа»).
- S12: «Не найдено» / «Битая ссылка или топик удалён».
- GuestNav error-mode: Primary «На главную» → `/`; catch-all неизвестных URL → S12; Share 403→S11, 404→S12.
- **Нарезка MVP-среза hi-fi (Scaffold → Auth → Topics → Share → Page Error) в YouGile — завершена** (фаза 4d).

### Этап 4e — agent-workflow (✅ 05.10.2026)

Канон: [`stage-4-brainstorm.md`](../stages/stage-4-brainstorm.md) §Agent-workflow.  
Артефакты: `.cursor/rules/collaboration/yougile-agent-workflow.mdc`; skills `yougile-planner` / `yougile-executor` / `yougile-reviewer`; обновлены `git.mdc`, `working-style.mdc`, `tech-stack.mdc`, `task-history.md`.

- **Колонки:** Бэклог → К работе → В разработке → На проверке → Готово.
- **Планировщик:** Бэклог → К работе только если зависимости в Готово и контракт готов. Без числа / «возьми задачу» → **1** карточка; «возьми N» → до **N**; затем передача оркестратору.
- ~~**Исполнитель (оркестратор):** один чат = одна задача~~ — **уточнено 05.10.2026** (см. блок ниже «Оркестратор + subagent»).
- **Команда владельца:** «возьми задачу/N» / «сделай …» / «прогони пайплайн» → оркестратор доводит набор до Готово (или стопа).
- **Ревью:** reviewer-subagent с пустым контекстом (handoff-пакет); чеклист в YouGile + ручной прогон; стек поднимать если есть; автотесты в репо пока нет.
- **Возврат:** На проверке → В разработке; доработка через executor-subagent из того же оркестратора; цикл **макс. 3** на задачу.

### Cleanup после ревью (уточнение 4e, 05.10.2026)

- Reviewer-subagent после прогона (OK и FAIL) **подчищает за собой**: стоп поднятых `dev`-процессов; удаление временных логов/артефактов чеклиста (например `.review-*.log`); без коммита мусора.
- Канон: skill `yougile-reviewer` §Cleanup; кратко — `yougile-agent-workflow.mdc`, `stage-4-brainstorm.md` §Ревью и DoD.

### Оркестратор + subagent на задачу (уточнение 4e, 05.10.2026)

- Родительский чат с владельцем = **оркестратор** (очередь, зависимости, цикл); может провести **несколько** задач подряд в одном диалоге.
- **Одна задача = один executor-subagent** (пустой контекст + brief); реализация и PR через `gh` — в subagent.
- «возьми задачу» → 1 в «К работе» → claim+работа первой; «возьми N» → N в «К работе», работа **последовательно** с первой; остальные ждут в очереди.
- Executor’ов **не параллелить** по умолчанию (общий `develop`).
- Канон: `yougile-agent-workflow.mdc`; skills `yougile-planner` / `yougile-executor` (режимы A/B).

### Agent / personal stores

- Создание и обновление файлов в **agent store** и **personal store** (вне репо Topic) — **без спроса** у владельца; штатная фиксация решений по `persist-decisions.mdc`.
- **Git (пересмотр):** ~~commit/push только по запросу~~ и ~~только main~~ отменены для исполнения карточек. База — **`develop`** (владелец создаёт вручную); ветка `feat/<ID>`; PR → `develop`; ревьюер мержит и **удаляет** ветку; в `main` агенты не пушат.
- **Коммиты по задаче:** `тип(ID): краткая суть` (пример: `feat(BAC-1): …`). Вне карточки — `тип: суть`.
- **PR по задаче:** в описании обязательно ссылка на карточку YouGile + краткий summary сделанного (шаблон в `git.mdc`).
- **task-history:** пишет ревьюер при OK: запись → commit на feat → merge PR → Готово.
- **`.env`:** локальные дефолты из `.env.example` без спроса; прод-секреты и коммит `.env` — спросить.
- **Баги (`Errors=Bug`):** тот же флоу; отдельный приоритет не фиксируем (стикер на будущее).
- **Отложено:** ревьюер пишет автотесты — [`docs/backlog/ideas.md`](../backlog/ideas.md).

---

## 06.10.2026

### Dev-образы MinIO (BAC-5)

- В `compose.yaml` для MinIO API/консоли и `mc` (init бакета) — **community-образы** `coollabsio/minio` + `pgsty/mc`: официальные `minio/minio` и `minio/mc` с осени 2025–2026 не тянутся анонимно с Docker Hub/Quay.
- S3-совместимость и роль «MinIO в dev» из стека **сохранены**; образы задокументированы в compose/README.
- При смене политики pull официальных образов — можно вернуться на `minio/*` отдельным PR.

### Длительность задач YouGile (agent-workflow)

- В отчёте оркестратора и в [`task-history.md`](task-history.md) фиксируем **wall-clock** с разбивкой: **реализация** (сумма прогонов executor) · **ревью** (сумма прогонов reviewer) · **всего**.
- Планировщик в длительность карточки не входит. Формат минут: `~12 мин` / `1 ч 05 мин`.
- Канон: skills `yougile-executor` / `yougile-reviewer`; `yougile-agent-workflow.mdc`; stage-4 §Ревью и DoD.

---

## 07.10.2026

### Figma MCP — фиксированный канал

- В форке TalkToFigma канал **всегда** `figma-mcp` (рандомный channelId отменён).
- Ручной минимум владельца: Figma Desktop → `bun socket` в `D:/mcp/cursor-talk-to-figma-mcp` → Connect в локальном плагине.
- Агент: `join_channel({ channel: "figma-mcp" })` без спроса; при ошибке — проверить три шага выше, не просить новый channelId.
- Rules: `.cursor/rules/design/figma-mcp-workflow.mdc`, `figma-mcp-limits.mdc`.

### task-history — ретрооценки длительности

- Пропуски поля **Длительность** в старых записях можно закрывать ретрооценкой (пометка в Заметках), чтобы сводки по доске не ломались.
- 07.10.2026 дополнены: BAC-1 (~4·~3·~7), BAC-4 (~4·~3·~7), BAC-5 (~6·~4·~10).

### task-history — формат записи (уточнение)

- Порядок полей: YouGile → Итог → Репо → Заметки (опц.) → **Доработка после ревью** → **Длительность** (в конце).
- **Доработка после ревью:** `нет` или `да (цикл N/3; …)` — был ли FAIL-возврат в «В разработке» до финального OK.
- Канон: [`task-history.md`](task-history.md); skill `yougile-reviewer`.

### Skill «запуск проекта»

- Project skill: `.cursor/skills/engineering/start-project/SKILL.md`.
- Skills раскладываем по секциям как rules: `collaboration/` (YouGile), `engineering/` (dev/стек + prod publish).
- Поднимает локальный стек Topic (infra → migrate deploy → `pnpm dev`); профили `full` / `infra` / `api` / `web`.
- Отчёт агента: markdown **вне** code fence (кликабельные ссылки); секции Infra / API / Web с таблицами + dev-креды; **длительность** старта (всего + по сервисам), не часы; профиль (`full`/…) в отчёт не писать.
- Остановка — зеркальный каркас («остановлен» + shutdown ~Xs); только по просьбе владельца или cleanup вызывающего skill (ревьюер).
- Канон: `.cursor/skills/engineering/start-project/SKILL.md`.

### Оценка объёма при обсуждении задачи

- Когда идёт **обсуждение** задачи / плана / прогона (ещё до «делай»), агент **всегда** даёт краткую **оценку объёма** wall-clock (диапазон минут/часов), с оговоркой предпосылок (живой стек, чистая БД и т.п.).
- Цель — калибровка ожидания владельца, не SLA. Формат как в планах: отдельный блок «Оценка объёма» + одна строка.
- Канон: `.cursor/rules/collaboration/working-style.mdc`.

### Auth — валидация форм

- Сообщения class-validator в auth DTO — **на русском** (без префикса поля вроде `email:`).
- На фронте login/register: сначала клиентская проверка (`apps/web/src/lib/auth-validation.ts`), запрос к API только если локально ок; бэкенд — дополнительная проверка.
- Тексты ошибок клиента зеркалят правила LoginDto / RegisterDto.

### Skill yougile-manual-close

- Project skill: `.cursor/skills/collaboration/yougile-manual-close/SKILL.md`; **только ручной** вызов (`disable-model-invocation`).
- Когда владелец уже написал/поправил код и прогнал вручную: анализ diff → карточка YouGile (эпик из стикера; новый эпик — только если текущие не подходят) → ветка **`тип/ID`** (`feat` / `fix` / `style` / …) от текущего HEAD → сначала запись в `task-history` → **один** коммит (код + история) → PR → `develop` → merge + удаление ветки → **Готово**.
- В **Длительность** писать дословно: `ручное изменение`. Amend feature-ветки после `gh pr create` (чтобы вписать PR в тот же коммит) — разрешён этим skill.
- Не путать с пайплайном «бери задачи» (planner → executor → reviewer).

### Форматирование после задач

- После любой задачи с правками в репо — **до коммита** `pnpm run format`; правки Prettier — в тот же коммит.
- Канон: `.cursor/rules/collaboration/working-style.mdc`; skills `yougile-executor` / `yougile-manual-close` / `yougile-reviewer`.

### S09 header — два состояния по сессии

- На `/t/:shareId` хедер зависит только от авторизации:
  - **гость** — `GuestNav` `ctaMode=share`: одна Primary **«Присоединиться»** → `/` (лендинг); без «Войти».
  - **авторизованный** — обычный `AppNav` (как в app).
- Орфография CTA: **«Присоединиться»** (с «и»; в Figma бывает опечатка «Присоедениться»).
- Без redirect владельца на S05; preview share остаётся на S09.

### Rank row — зона grab

- Справа на RankRow (код + Figma UI-Kit): **`grab-zone`** ~44px на всю высоту карточки — DnD только отсюда (`cursor-grab`); тело карточки — клик в деталку (`cursor-pointer`).
- Визуал зоны: fill `color/surface-sunken`, левый edge `color/line`, правые углы `radius/md`; Drag — fill `color/accent/soft`; Hover-карточки — fill зоны `color/line` (контраст к sunken-карточке).
- Figma: masters `Rank row MOBILE` (`35:614`) и `Rank row DESKTOP` (`34:1561`), все варианты с handle; **NoDragable** без зоны. Instances на S05 подтягиваются из masters.

### DnD — `@vue-dnd-kit/core` (вариант B)

- Библиотека: **`@vue-dnd-kit/core`** (согласие владельца; раньше — нативный Pointer DnD).
- Разделение: **`RankRow`** — только UI; **`RankRowDraggable`** — `makeDraggable` + handle `[data-slot=drag-handle]`; S05 — `makeDroppable` + `suggestSort`.
- `DnDProvider` на корне (`App.vue`), чтобы inject работал у потомков.
- Live-gap: source схлопывается, щель по hover (без перестановки DOM во время drag).
- ranked reorder → `reorder`; inbox→ranked → `rank` + при mid-insert ещё `reorder` (визуальная щель = позиция вставки; ранее «только в конец» ослаблено для UX gap).

---

## 08.10.2026

### Комментарии в коде — минимум

- По умолчанию **без** комментариев; оставлять только неочевидный why / инвариант / ограничение либы.
- Не писать пересказ кода, историю дебага, навигационные HTML-комментарии «секция X».
- **В `<style>` / CSS / SCSS** — без комментариев (в т.ч. «перевод» в Tailwind вроде `// max-w-91.5`).
- Канон: `.cursor/rules/engineering/code-comments.mdc`.

### Tailwind — suggestCanonicalClasses

- В UI писать классы в канонической форме IntelliSense (`rem: 16`): px→шкала для spacing/leading/size, `h-(--token)`, `foo!` вместо `!foo`.
- Шрифтовые `text-[Npx]` не заменять на spacing-`text-N`, если компилятор так не канонизирует (у нас `--text-*`).
- Канон: `.cursor/rules/engineering/tailwind-canonical.mdc`.

### Prod-хостинг и CI/CD (VPS)

- **Хостинг:** VPS (PL), Ubuntu 22.04, Docker Compose в `/opt/topic`.
- **Стек на сервере:** Caddy (образ `topic-web`: SPA + reverse proxy) + Nest (`topic-api`) + Postgres + MinIO (обложки на том же VPS).
- **Сеть (было):** один origin по **HTTP/IP без TLS** на первом этапе; MinIO/Postgres наружу не публиковать.
- **Сеть (с 09.10.2026):** HTTPS на IP (LE short-lived) — «Prod TLS на IP»; **с 12.10.2026 канон — домен** `topi-ki.ru` (см. «Prod — домен topi-ki.ru»).
- **CI/CD:** GitHub Actions при push в **`main`** → GHCR (`topic-api`, `topic-web`) → SSH deploy. Канон: [`deploy.md`](deploy.md).
- **Promote:** фичи через `develop`; релиз = merge в `main` (skill `publish-prod`, путь `.cursor/skills/engineering/publish-prod/`).
- **Версии:** перед каждым promote `develop`→`main` (skill `publish-prod`) **обязательно** выставить semver в корневом `package.json` (`version`) и синхронизировать `apps/api` / `apps/web` с тем же номером; после merge в `main` — annotated git tag `vMAJOR.MINOR.PATCH` на merge-commit. Skill предлагает bump, владелец подтверждает (или задаёт номер / «следующая» в команде).
- **История релизов (09.10.2026):** канон — корневой [`CHANGELOG.md`](../../CHANGELOG.md) (текстовые буллеты на версию); зеркало — **GitHub Release** на тег (`gh release create` в `publish-prod`). Не дублировать смысл в `task-history` (там карточки, не релизы).
- **Отложено (остаток B и прочее):** файл `VERSION` / version в health·UI / теги образов GHCR `:X.Y.Z`; rate-limit auth, внешний object storage.
- **Снято с отложенного:** TLS + `Secure` cookie (09.10, путь A на IP); **купленный домен** (12.10, `topi-ki.ru`).
- **Отмена (частично):** ранее (тот же день) откладывали bump `package.json` — **снято** 08.10.2026 по решению владельца.

### S05 — accent-обводка RankedDropZone (drag-over)

- Визуальный highlight зоны «Рейтинг» при drag-over (ring/outline accent) **отложен**.
- Сейчас: `RankedDropZone` остаётся droppable без accent-обводки; feedback — live-gap / spacer.
- Вернуться явно; на мобилке inset-ring без padding ломался (карточки перекрывали обводку) — при возврате: outer outline/ring или padding ≥ толщины ring.
- См. `docs/backlog/ideas.md`.

### Vue UI — Tailwind vs SCSS (`пересматриваем`)

- **`apps/web/src/components/ui-kit/**`:** стили **только SCSS** (`<style lang="scss" scoped>`), без Tailwind-утилит в template.
- Страницы / layouts: короткие наборы — Tailwind в template; длинные «простыни» — SCSS.
- В `<style>` / SCSS размеры и отступы — в **`px`**, не `rem` (база `1rem = 16px`, как у Tailwind canonical).
- Не писать лишние CSS/утилиты без нужды в текущем layout (например `flex: 1` / `width: 100%` без flex-родителя / без эффекта).
- **Отмена:** запрет SCSS из стека этапа 3 / `tech-stack.mdc` — снят 08.10.2026 по явному «пересматриваем».
- Глобальные SCSS-части / отказ от Tailwind на страницах — по-прежнему нет без отдельного пересмотра.
- Миграция старых UI (AppButton и т.д.) на SCSS — отдельно; новые UI — сразу SCSS.
- Канон: `.cursor/rules/engineering/vue-scss.mdc`.

### Vue SFC — props / emits interfaces

- Props и emits — именованные `interface`: `ComponentNameProps` / `ComponentNameEmits` (не анонимные generic у `defineProps` / `defineEmits`).
- Emits — call-signature: `(e: 'event', …): void`.
- Канон: `.cursor/rules/engineering/vue-sfc-api.mdc`.

### VueUse — брейкпоинты Tailwind

- Добавлен **`@vueuse/core`** в `apps/web` (08.10.2026): JS media queries через `useBreakpoints(breakpointsTailwind)`.
- **Впредь** для JS-брейкпоинтов — только `useTailwindBreakpoints()` (`apps/web/src/composables/useTailwindBreakpoints.ts`).
- Запрещено: ручной `matchMedia` + `resize`; прямой `useBreakpoints`/`breakpointsTailwind` вне обёртки; Vuetify `useDisplay`.
- Чистый CSS/`md:` в template — без VueUse.
- Канон: `.cursor/rules/engineering/vue-breakpoints.mdc`.

### Vue Router — RouteName enum

- Имена маршрутов — `enum RouteName` в `apps/web/src/router/route-names.ts`.
- Не использовать строковые литералы имён (`'app-topics'`) в router/навигации.
- Канон: `.cursor/rules/engineering/vue-route-names.mdc`.

---

## 09.10.2026

### Frontend — структура `components/`

- `apps/web/src/components/ui` → **`ui-kit/`** — переиспользуемый DS без бизнес-логики (нет `@/api/*`, нет жёсткой привязки к app-routes).
- **`layout/`** — chrome и page shells: `AppNav`, `GuestNav`, `ContentPageWrapper`, `ErrorStateView`.
- **`topic/`** — DnD/ранги с `ItemDto`: `RankRowDraggable`, `RankedDropZone`, `DnDAnimatedPreview`.
- Импорты: `@/components/ui-kit`, `@/components/layout`, `@/components/topic` (barrels `index.ts`).
- Правило «только SCSS» относится к **`components/ui-kit/**`** (бывший `ui/**`).

### Frontend — именование ui-kit (`T` = Topic)

- Компоненты в `ui-kit/` — шаблон **`TComponentName`**: `TButton`, `TInput`, `TError`, `TLoader`, `TEmptyState`, `TMainChip`, `TPrivacyChip`, `TCoverUpload`, `TRankRow`, `TTopicRow` (`App*` → `T*` без `App`).
- Связанные типы: `TButtonVariant` / `TButtonSize` / `TInputType` / `TRankRowMode` / `TMainChipLabel`; доменный `PrivacyValue` без префикса.
- Layout/topic компоненты префикс `T` не получают.

### Prod TLS на IP (вариант A)

- **Решение владельца:** HTTPS на проде **без покупки домена** — сертификат Let's Encrypt **на публичный IPv4** (short-lived ~6 суток), не бесплатный hostname (DuckDNS и т.п.).
- **Prod IP / ACME:** `PUBLIC_HOST=31.76.22.106`, `PUBLIC_BASE_URL=https://31.76.22.106`, `ACME_EMAIL=nejative@yandex.ru`.
- **Edge:** Caddy 2.11 в `topic-web`: site `{$PUBLIC_HOST}`, `tls { issuer acme { profile shortlived } }`, `default_sni`, порты **80 + 443**, тома `caddy_data` / `caddy_config`.
- **App:** `PUBLIC_BASE_URL=https://…` → session cookie **`Secure`** (и clearCookie в том же духе).
- **Владелец на VPS:** открыть **443** (ufw/панель), обновить `.env`, smoke `https://31.76.22.106/` (логин, обложки, share).
- **Снято (12.10.2026):** купленный домен — см. «Prod — домен topi-ki.ru» (обычный LE на имя; shortlived-IP больше не канон).
- Канон: `docs/process/deploy.md`, `tech-stack.mdc`, stage-3 строка деплоя.

### CI/CD — ускорение деплоя

- **Решение владельца:** оптимизировать wall-clock Deploy без смены топологии (VPS + GHCR + Compose).
- **Сделано:** параллельные jobs `build-api` / `build-web` → `deploy`; раздельные GHA cache `scope=topic-api` / `topic-web`; multi-stage slim `topic-api` (`pnpm --filter api deploy --prod`); на VPS `pull api web` (не postgres/minio); `prisma` + `dotenv` в dependencies api для migrate в entrypoint без pnpm в runtime.
- **Канон для агентов:** `docs/process/deploy.md` §«CI/CD — инварианты скорости»; правило `.cursor/rules/engineering/deploy-ci.mdc`.
- **Отложено:** path-filter на один образ; self-hosted runner; убрать `docker login` из каждого SSH (public GHCR / разовый login на VPS).

### Skill publish-prod → engineering

- Project skill перенесён: `.cursor/skills/collaboration/publish-prod/` → `.cursor/skills/engineering/publish-prod/SKILL.md`.
- Рядом с `start-project` (локальный стек / прод-релиз); не YouGile-флоу.
- Slash `/publish-prod` и `name` в frontmatter без изменений.

### Этап 5 — закрытие MVP (follow + лента)

- Заведён [`../stages/stage-5-brainstorm.md`](../stages/stage-5-brainstorm.md); фаза **5a** (docs kickoff) ✅.
- Модель соцсвязи: **односторонняя подписка (follow)** — без заявок и взаимности (как stage-1); UI-термины «Подписаться» / «подписка», не «друзья».
- Scope этапа 5: S10 + follow + S13 (дизайн hi-fi, API, YouGile, реализация). Хвост **5f**: позже выбрать **1–2** пункта из `ideas.md` — последними, состав отдельным решением.
- S10/S13 возвращены из отложения hi-fi этапа 2 → этап 5 (см. `ideas.md`).

### Этап 4 — закрыт

- **Решение владельца (09.10.2026):** этап 4 ✅ закрыт (YouGile, agent-workflow, нарезка MVP-среза, реализация **4f**).
- Канон: [`../stages/stage-4-brainstorm.md`](../stages/stage-4-brainstorm.md).
- Дальнейшее исполнение карточек YouGile и записи в `task-history` — штатно, без отдельного «этапа 4».
- Активный этап трекера: **5** (закрытие MVP).

### Этап 5 — уточнения UI перед 5b

- **Карточка ленты (S13):** как «Мои топики» / Topic row — до 3 обложек + title + meta; **privacy-chip в ленте скрыт** (всё public).
- **Таб «Профиль»:** ведёт на свой `/u/:nick` (тот же S10); отдельного «настройки/я» нет.
- **S10 мета:** лёгкие счётчики подписчиков / подписок (числа); списки подписчиков в MVP не делаем.
- Порядок hi-fi **5b:** по одному экрану (M+D), ждать аппрув; старт — **S13 Лента**.

### Этап 5 — 5b дизайн (09.10.2026, продолжение)

- **S13** (List / Empty / Empty·subscribed, M+D) + nav `Select=List|Topic|Profile` с soft-well — **аппрув владельца**.
- **S10** (List / Empty / Subscribed / Own, M+D) — **аппрув владельца** (правки владельца после ревью). Чужой: счётчики + Подписаться/Отписаться; свой (`Select=Profile`): без CTA. Секции «Открытые топики» нет; rows без privacy-chip. CTA снизу только на mobile.
- Фаза **5b** ✅ → дальше **5c** (контракт API Follow + лента).

### Этап 5 — 5c контракт API (09.10.2026)

- **Аппрув владельца.** Канон: [`stage-5-brainstorm.md`](../stages/stage-5-brainstorm.md) §5c.
- Prisma `Follow`; `GET /users/:nick` (auth опционален: `isSelf` / `isFollowing`); `POST|DELETE /users/:nick/follow` → 204 идемпотентно; `GET /feed` → `{ followingCount, items }` с `ownerNick`; на S10 только public; свои топики в ленту не попадают.
- Фаза **5c** ✅ → дальше **5d** (нарезка YouGile Social).
- Уточнение при 5d: в `ProfileTopicDto` / `FeedItemDto` добавлен **`shareId`** (навигация на `/t/:shareId`).

### Этап 5 — 5d нарезка YouGile Social (09.10.2026)

- Эпик **Social** в бэклоге BAC/FRO:
  - **BAC-20** Follow Prisma → **BAC-19** profile, **BAC-18** follow, **BAC-17** feed
  - **FRO-30** AppNav+роуты; **FRO-31** API-клиент; **FRO-29** S10; **FRO-28** S13
- Стикер: на досках появился «Эпик (2)/(3)» со значением Social (старый «Эпик» без Social оставлен для старых карточек — при желании слить вручную).
- Фаза **5d** ✅ → **5e** по agent-workflow.

### История релизов — CHANGELOG + GitHub Releases (09.10.2026)

- **A+B:** канон текста — корневой `CHANGELOG.md` (буллеты); зеркало — GitHub Release на `vX.Y.Z`.
- Источник буллетов при релизе: осмысленный diff `main..develop` (не сырой dump всех коммитов).
- В тексте релизов **не** упоминать id/названия карточек YouGile (`BAC-…` / `FRO-…`).
- Вшить в skill `publish-prod`: правка CHANGELOG вместе с bump → после тега `gh release create`.

## 11.10.2026

### S10 — свой профиль: копирование ссылки и выход

- Отдельной страницы «настройки / я» по-прежнему **нет** (решение перед 5b).
- На своём S10 (`isSelf`): у ника иконка copy (`info`, как S05); справа — «Выйти» (mobile — иконка) → `POST /auth/logout` → лендинг.
- Смена ника / email / пароля — вне MVP.

### GuestNav — одна CTA

- GuestNav: fixed auto dock; бренд и CTA → `/`; везде одна Primary **«Присоединиться»** (S09/S10 guest, S11/S12). Без «Войти» / «На главную» в nav (вход — с лендинга).

### Палитра — dark green (jewel)

- Dark UI: `bg` `#0C0C10`, `surface` `#12121A`, brand green `#2F8F63` / hover `#3DA87A` (ярче сырого Vue-green для CTA не берём), purple secondary `#A879E6`.
- Текст `#E4E4E7` / `#A1A1AA` / `#71717A`; линии `#27272A`.
- Danger `#F66F81` только destructive; warning `#F9B44E`; success `#3DD68C`.
- Privacy: private warning / unlisted info(purple) / public success; selected = soft + обводка.
- Rank rows: green `row` в тоне brand soft; exploration `feat/palette-clay` удалена (12.10.2026).

## 12.10.2026

### Liquid-glass (nav + карточки)

- Утилита `glass`: полупрозрачный `surface` (62%, hover 78%) + blur 20px + обводка white@12%.
- Где: AppNav / GuestNav, TopicRow, EmptyState, Login/Register, inbox/ranked panels (md+).
- Где нет: инпуты, secondary-кнопки, cover upload, RankRow (`row/*`).
- Fallback без `backdrop-filter`: непрозрачный `surface`.
- Скролл под dock: inset 88px внутри `PageShell` body (M bottom / D top), не padding layout; header в scroll-потоке, чтобы карточки уезжали под nav.
- DnD drop-slot (источник + insert): fill `row` @ 55% + `bg` — темнее прежнего mix с `surface`.

### AppNav — sliding soft-well

- Mobile: pill 32×32 под иконкой; desktop: pill по размеру пункта (translate + width/height) ~220ms.
- Актив = цвет; вес/padding стабильны (без layout jump). `prefers-reduced-motion` — без transition.

### Page fade

- Смена страницы: `page-fade` opacity ~120ms, `mode="out-in"` в MainLayout / AuthLayout.
- `prefers-reduced-motion` — без transition.

### TApproveModal

- Confirm-модалка вместо `window.confirm`: удаление топика/элемента, выход из аккаунта.
- UI-kit SCSS: scrim + glass; M bottom sheet ≤390, D centered ≤480; confirm `danger-ghost`.
- Пока `confirmLoading` — нельзя закрыть scrim/Escape.

### MVP зафиксирован

- Этап **5** и Must MVP ✅ закрыты владельцем (12.10.2026): Auth, Topics, Share, Social (follow + лента + S10), UI-полировка.
- **5f** (хвост из `ideas.md`) **не** входит в MVP — post-MVP отдельным решением.
- Трекер: [`stages-todo.md`](stages-todo.md); итог этапа — [`../stages/stage-5-brainstorm.md`](../stages/stage-5-brainstorm.md).

### Prod — домен topi-ki.ru (вариант B)

- **Решение владельца:** купленный домен **`topi-ki.ru`**; канон apex + **`www.topi-ki.ru` → 301** на apex.
- **Origin:** `PUBLIC_HOST=topi-ki.ru`, `PUBLIC_BASE_URL=https://topi-ki.ru` (cookie `Secure` без изменений).
- **TLS:** обычный Let's Encrypt на имя (не shortlived-IP). Профиль `shortlived` в Caddy снят.
- **DNS (владелец у регистратора):** `A` для `@` и `www` → `31.76.22.106` (или `www` CNAME → apex, если регистратор позволяет).
- **VPS:** обновить `/opt/topic/.env`; выкат образа `topic-web` с новым Caddyfile (том `caddy_data` сохранить).
- **Отменяет отложенное** «купленный домен» из 08–09.10.2026; HTTPS по IP остаётся запасным доступом, канон — домен.
- Канон: `docs/process/deploy.md`, `deploy/Caddyfile`, `deploy/.env.example`.

### Prod Postgres — localhost для админ-доступа

- В `deploy/compose.prod.yaml` у `postgres`: `ports: ['127.0.0.1:5432:5432']` — только loopback на VPS, не в интернет.
- Доступ владельца: SSH-туннель / TablePlus Over SSH → `127.0.0.1:5432`, SSL off; креды из `/opt/topic/.env`.
- Закреплено в `develop` без bump версии (вариант B); на VPS уже применено вручную; в prod через CI — со следующим promote в `main`.
- Канон: `docs/process/deploy.md`.

## 17.10.2026

### Copy from share — флаг «уже есть у меня» отложен

- Копирование элемента из чужого `/t/:shareId` в inbox своего топика той же категории — **есть** (`POST …/items/copy-from-share`).
- Дубликат сейчас: только при копировании в **конкретный** топик, по `meta.sourceUrl` → 409; без `sourceUrl` заранее не детектим.
- **Не делаем сейчас** префлаг / дизейбл кнопки «уже есть в каком‑то моём топике».
- При возврате сначала выбрать семантику: (A) глобально «есть хоть где‑то» vs (B) дизейбл в picker по топикам; предпочтительнее B под текущий флоу. Реализация лёгкая (batch по `sourceUrl` при auth).
- Идея в backlog: [`../backlog/ideas.md`](../backlog/ideas.md) («Copy from share — already owned»).

## 16.10.2026

### Категория games (игры) — RAWG, meta вариант A

- **Пересматриваем** «вне v1» для игр из Catalog (15.10.2026): добавляем категорию **`games`**.
- Провайдер: **RAWG** (`GET /api/games?search=`, `GET /api/games/{id}`); секрет `RAWG_API_KEY` только на Nest.
- **Meta вариант A:** тот же контракт строк, что у `movies`/`series` — `description` / `director` / `genre` / `country` / `sourceUrl`.
- RAWG: `name`→title, `released`→year в поиске, `background_image`→cover, `description_raw`→description, первый developer→`director`, первый genre→`genre`, первая platform→`country`; `sourceUrl` = `https://rawg.io/games/{slug}`.
- UI: лейбл `director` для games — **«Разработчик»**; поле `country` / «Платформа» **не показываем** на фронте (может оставаться в meta с RAWG).
- `from-catalog`: `provider: 'tmdb' | 'rawg'` (movies/series → tmdb; games → rawg).
- Attribution в UI поиска (ссылка на RAWG).
- Смена `category` после create, IGDB, books, externalId — вне slice.
- **YouGile:** по одной карточке BAC + FRO (эпик Catalog); PR → `develop`.
- План: [`../feature/catalog-enrichment.md`](../feature/catalog-enrichment.md).

### Категория series (сериалы) — TMDB TV, meta вариант A

- **Пересматриваем** «вне v1» для сериалов из Catalog (15.10.2026): добавляем категорию **`series`**.
- Провайдер: тот же **TMDB**, эндпоинты `/search/tv` и `/tv/{id}` (+ credits); ключ/токен без изменений.
- **Meta вариант A:** тот же контракт строк, что у `movies` — `description` / `director` / `genre` / `country` / `sourceUrl` (без отдельного ключа `creator`).
- TMDB: `name`→title, `first_air_date`→year в поиске, `overview`→description, `created_by[0].name`→`director`, первый genre / production country; `sourceUrl` = `https://www.themoviedb.org/tv/{providerId}`.
- UI: лейбл поля `director` для series — **«Создатель»** (ключ API не меняем).
- Смена `category` после create, сезоны/network, externalId — по-прежнему вне slice.
- **YouGile:** по одной карточке BAC + FRO (эпик Catalog); PR → `develop`.
- План: [`../feature/catalog-enrichment.md`](../feature/catalog-enrichment.md).

### S09 — read-only деталка элемента

- Клик по RankRow на публичном share → **`/t/:shareId/items/:itemId`** (`ShareItemView`), без `requiresAuth`.
- Данные из уже существующего `GET /api/t/:shareId` (`ShareItemDto` + `category`); отдельный item-эндпоинт не делаем.
- Только просмотр: обложка + title; для `movies` — meta (description / genre / director / country / sourceUrl), если есть. Без edit CTA; владелец с S09 **не** уходит в S07.
- Неверный `itemId` при валидном share → `NotFound`; 403/404 share — как на S09.

### Item.meta.sourceUrl — ссылка на источник (from-catalog)

- При `POST .../items/from-catalog` Nest пишет `meta.sourceUrl` = `https://www.themoviedb.org/movie/{providerId}`.
- В create/update с клиента `sourceUrl` **игнорируется**; при PATCH остальных meta-полей текущий `sourceUrl` сохраняется.
- Ручной create → без `sourceUrl`. UI: read-only ссылка «Источник» на S07 и ShareItemView.
- Это не `externalId` для дедупа — только публичный URL.

### Item.meta — поля фильма (director / genre / country)

- **Хранение:** на `Item` опциональный **`meta Json?`** (не плоские колонки) — один контейнер под category-specific поля.
- **movies:** опциональные строки `description` (из TMDB `overview`), `director`, `genre`, `country` (singular), `sourceUrl` (только from-catalog); каталожный и ручной элемент — один контракт редактируемых полей.
- **custom:** `meta` всегда `null`; передача meta → `400`.
- **TMDB from-catalog:** details + `credits` → первый Director / genre / production country + `sourceUrl`.
- **UI v1:** S06 (ручная форма) + S07; RankRow / S09 UI — позже (meta уже в `ItemDto` / `ShareItemDto`).
- **YouGile:** BAC-24, FRO-39 (эпик Catalog); ветка `feat/catalog-enrichment`.
- План/контракт: [`../feature/catalog-enrichment.md`](../feature/catalog-enrichment.md).

## 15.10.2026

### Каталог при добавлении элементов (вариант A)

- **Проблема:** на S06 название и обложка вводятся вручную — friction на длинном топе.
- **Решение:** категория топика (enum) + поиск во внешнем API для известных категорий; своя категория — без автодополнения; в каталожном топике всегда путь «создать свой элемент» вручную.
- **Модель Item без расширения схемы карточки:** каталог только префиллит title + cover (одна модель для всех топиков).
- **Scope v1:** категории `movies` | `custom`; провайдер **TMDB** (фильмы); обложку копируем в MinIO; ключ только на Nest.
- **Вне v1:** сериалы/игры/книги, unfurl URL, хранение `externalSource`/`externalId` на Item (связь с id в TMDB не нужна для первого slice — копируем данные один раз).
- **План:** [`../feature/catalog-enrichment.md`](../feature/catalog-enrichment.md).
- **Backlog:** идея «Категории топиков» переведена в эту фичу (больше не «только post-MVP идея без плана»).

### Провайдер каталога фильмов — TMDB

- После сравнения бесплатных API (OMDb, kino.is, Kinopoisk Unofficial, ПоискКино, no-key скрейперы) владелец выбрал **TMDB**.
- Критерии: title + poster в search, `language=ru`, стабильность, свой image CDN, free non-commercial + attribution.
- Детали и отвергнутые альтернативы — в [`../feature/catalog-enrichment.md`](../feature/catalog-enrichment.md) §«Провайдер: TMDB».

### Нарезка YouGile — Catalog

- Эпик **Catalog**: **BAC-21…23**, **FRO-36…38** в Бэклог; таблица и AC — [`../feature/catalog-enrichment.md`](../feature/catalog-enrichment.md) §«Нарезка YouGile».
- При нарезке: дефолт category `custom`; year только в поиске; без смены category после create; from-catalog (A1); hi-fi не блокирует.

### Catalog — интеграционная ветка и UX без Figma (15.10.2026)

- Интеграция эпика: **`feat/catalog-enrichment`** (не сразу в `develop`).
- Карточки по-прежнему **одна ветка = одна задача** (`feat/BAC-21` …), но **PR base / merge → `feat/catalog-enrichment`**, не `develop`.
- Hi-fi в Figma для Catalog **не делаем**: UI сразу в коде по [`../feature/catalog-enrichment.md`](../feature/catalog-enrichment.md) и UI-kit.

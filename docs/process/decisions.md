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
- Также не решено / позже: OG-превью (отдельный slice), **тесты** (владелец: делаем отдельно, не добавляем сейчас), prod-хостинг и prod-хранилище, rate-limit на auth, способ подключения токенов в Tailwind.
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
  - **`Errors`** (`string`, значение `Bug`) — только **баги**, не эпик экранов ошибок.
- S08 / S10 / S13 — вне MVP-среза, значений эпика нет.
- «Первые эпики» как карточки-родители — не заводили; эпик = стикер на задачах (4d).

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

- Guest chrome на S09: Primary **«Войти»** → `/login`; Ghost **«Присоединиться»** → `/` (орфография с «и»; в Figma опечатка «Присоедениться»).
- Владелец на своём unlisted/public `/t/:shareId` остаётся на **S09** (preview как у гостя), без redirect на S05; CTA «Редактировать» на S09 не делаем в этом эпике.
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
- Skills раскладываем по секциям как rules: `collaboration/` (YouGile), `engineering/` (dev/стек).
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

# Деплой Topic (VPS + GitHub Actions)

Канон решения: [`decisions.md`](decisions.md) (08.10.2026 — prod-хостинг; 09.10.2026 — TLS на IP).

## Топология

- **VPS:** Ubuntu 22.04, Docker Compose.
- **Edge:** Caddy (`topic-web`) на `:80` + `:443` — SPA, `/api/*` → Nest, `/{S3_BUCKET}/*` → MinIO; HTTPS на публичный IPv4 (Let's Encrypt short-lived ~6 суток).
- **Обложки:** same-origin `/{bucket}/{key}` (`S3_PUBLIC_URL=.` у api); не `127.0.0.1:9000` в браузере.
- **Данные:** Postgres + MinIO на том же VPS (тома Docker); том `caddy_data` — сертификаты (не терять при recreate).
- **CI:** push в `main` → параллельный build/push `topic-api` + `topic-web` в GHCR → SSH → `compose pull api web` + `up`.
- **Origin:** `https://<PUBLIC_HOST>/`; session cookie с `Secure`.

Каталог на сервере: `/opt/topic` (`compose.prod.yaml`, `.env`).

## CI/CD — инварианты скорости (для агентов)

Канон workflow: `.github/workflows/deploy.yml`. Не откатывать без явного «пересматриваем».

1. **Параллельные jobs** `build-api` / `build-web`, затем короткий `deploy` (`needs`). Не складывать оба билда в один job подряд.
2. **GHA cache scopes раздельно:** `scope=topic-api` и `scope=topic-web` (`cache-from` / `cache-to` `type=gha,mode=max`). Общий scope без разделения — вытеснение слоёв.
3. **API-образ multi-stage:** build (toolchain + `pnpm install`) → runtime `node:20-bookworm-slim` через `pnpm --filter api deploy --prod`; в runtime только `openssl`/`ca-certificates`, без `python3`/`make`/`g++`/`pnpm`. Entrypoint: `./node_modules/.bin/prisma migrate deploy` → `node dist/main.js`. `prisma` и `dotenv` — **dependencies** api (migrate на старте), не уносить в devDependencies.
4. **На VPS:** `docker compose … pull api web` — не тянуть postgres/minio на каждый деплой. `up -d` без `--no-deps` (нужны `depends_on` / первый подъём).
5. **Web** остаётся multi-stage → `caddy:2.11-alpine` + статика.
6. **Не делать без отдельного OK:** multi-arch, self-hosted runner на VPS, path-filter «собрать только изменённый образ» (сложнее handoff/отката), смена registry.

Следующие рычаги (бэклог, не блокер): path filters на jobs; public GHCR + разовый `docker login` на VPS (убрать login из каждого SSH); уменьшить интервал health-loop после стабилизации slim-api.

## Одноразово на VPS

1. Установить Docker Engine + Compose plugin.
2. Firewall: открыть `22`, `80`, **`443`** (MinIO/Postgres наружу не публиковать).
3. Пользователь деплоя в группе `docker` (или root — хуже).
4. Каталог и env:

```bash
sudo mkdir -p /opt/topic
sudo chown "$USER":"$USER" /opt/topic
cd /opt/topic
# скопировать содержимое deploy/.env.example → .env
nano .env   # PUBLIC_HOST, PUBLIC_BASE_URL=https://…, ACME_EMAIL, пароли, bucket
```

5. SSH-ключ только для деплоя; публичный ключ в `~/.ssh/authorized_keys`.
6. (Рекомендуется) GitHub PAT с `read:packages` один раз:

```bash
echo '<PAT>' | docker login ghcr.io -u <github-user> --password-stdin
```

Пакеты `topic-api` / `topic-web` после первого push можно сделать **public** в GHCR — тогда pull без login.

Первый выкат можно не ждать CI:

```bash
# после появления образов :latest в GHCR
cd /opt/topic
docker compose -f compose.prod.yaml pull api web
docker compose -f compose.prod.yaml up -d
curl -fsS --resolve "${PUBLIC_HOST}:443:127.0.0.1" "https://${PUBLIC_HOST}/api/health"
```

## Secrets в GitHub (Settings → Secrets)

| Secret | Назначение |
|--------|------------|
| `VPS_HOST` | IP или hostname VPS |
| `VPS_USER` | SSH user |
| `VPS_SSH_KEY` | приватный ключ (PEM), пара к authorized_keys |

`GITHUB_TOKEN` в workflow уже пишет в GHCR (`packages: write`).

## Релизный поток

1. Фичи мержатся в `develop` (PR).
2. Promote: skill **`publish-prod`** (`.cursor/skills/engineering/publish-prod/`, или вручную) — перед PR в `main` выставить semver в корневом `package.json` и в `apps/api` / `apps/web` → PR / merge `develop` → `main`.
3. **Версия:** annotated git tag `vX.Y.Z` на merge-commit в `main` (номер = `package.json` `version`). Файл `VERSION` / health·UI / теги GHCR `:X.Y.Z` — отложено.
4. Workflow `Deploy` собирает образы, синхронизирует `compose.prod.yaml`, поднимает стек, ждёт HTTPS `/api/health` (через `--resolve` на `PUBLIC_HOST`).

## Откат

На VPS в `.env` выставить предыдущие теги SHA и:

```bash
cd /opt/topic
docker compose -f compose.prod.yaml pull api web
docker compose -f compose.prod.yaml up -d
```

Теги: `ghcr.io/nejative/topic-api:<sha>`, `…/topic-web:<sha>`.

## Smoke после деплоя

- `https://<PUBLIC_HOST>/` — SPA (без предупреждения браузера о сертификате)
- `https://<PUBLIC_HOST>/api/health` — `{"status":"ok",…}`
- регистрация / логин (cookie `Secure`)
- топик + обложка (URL вида `https://<PUBLIC_HOST>/topic-covers/…`)
- share-ссылка

## Переход с HTTP (разово)

1. Открыть **443** на VPS / у провайдера.
2. В `/opt/topic/.env` задать `PUBLIC_HOST`, `PUBLIC_BASE_URL=https://…`, `ACME_EMAIL`, `HTTPS_PORT=443`.
3. После выката образа с новым Caddyfile — `compose up -d` (том `caddy_data` появится сам).
4. Старые HTTP-закладки → обновить на HTTPS; перелогиниться.

## Вне текущего этапа

Купленный домен (обычный LE на имя), rate-limit auth, внешний S3/managed Postgres, автотесты в CI.

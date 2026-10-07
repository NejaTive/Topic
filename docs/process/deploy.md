# Деплой Topic (VPS + GitHub Actions)

Канон решения: [`decisions.md`](decisions.md) (08.10.2026 — prod-хостинг).

## Топология

- **VPS:** Ubuntu 22.04, Docker Compose.
- **Edge:** Caddy (`topic-web`) на `:80` — SPA, `/api/*` → Nest, `/{S3_BUCKET}/*` → MinIO.
- **Данные:** Postgres + MinIO на том же VPS (тома Docker).
- **CI:** push в `main` → build/push образов в GHCR → SSH → `compose up`.
- **Первый этап:** HTTP по IP, без TLS и без `Secure` cookie.

Каталог на сервере: `/opt/topic` (`compose.prod.yaml`, `.env`).

## Одноразово на VPS

1. Установить Docker Engine + Compose plugin.
2. Firewall: открыть `22` и `80` (MinIO/Postgres наружу не публиковать).
3. Пользователь деплоя в группе `docker` (или root — хуже).
4. Каталог и env:

```bash
sudo mkdir -p /opt/topic
sudo chown "$USER":"$USER" /opt/topic
cd /opt/topic
# скопировать содержимое deploy/.env.example → .env
nano .env   # PUBLIC_BASE_URL=http://<IP>, пароли, bucket
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
docker compose -f compose.prod.yaml pull
docker compose -f compose.prod.yaml up -d
curl -fsS "http://127.0.0.1/api/health"
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
2. Promote: PR / merge `develop` → `main` (владелец).
3. Workflow `Deploy` собирает образы, синхронизирует `compose.prod.yaml`, поднимает стек, ждёт `/api/health`.

## Откат

На VPS в `.env` выставить предыдущие теги SHA и:

```bash
cd /opt/topic
docker compose -f compose.prod.yaml pull
docker compose -f compose.prod.yaml up -d
```

Теги: `ghcr.io/nejative/topic-api:<sha>`, `…/topic-web:<sha>`.

## Smoke после деплоя

- `http://<IP>/` — SPA
- `http://<IP>/api/health` — `{"status":"ok",…}`
- регистрация / логин (cookie)
- топик + обложка (URL вида `http://<IP>/topic-covers/…`)
- share-ссылка

## Вне текущего этапа

Домен, TLS (в Caddy), `Secure` cookie, rate-limit auth, внешний S3/managed Postgres, автотесты в CI.

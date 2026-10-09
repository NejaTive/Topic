# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS build

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@9.14.2 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/

RUN pnpm install --frozen-lockfile --filter api...

COPY tsconfig.base.json ./
COPY apps/api apps/api

WORKDIR /app/apps/api

# prisma generate / config требуют URL; на build-этапе БД не нужна
ENV DATABASE_URL=postgresql://topic:topic@127.0.0.1:5432/topic

RUN pnpm run build \
  && chmod +x docker-entrypoint.sh

WORKDIR /app
RUN pnpm --filter api deploy --prod /deploy

FROM node:20-bookworm-slim AS runtime

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=build /deploy ./
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/prisma ./prisma
COPY --from=build /app/apps/api/prisma.config.ts ./prisma.config.ts
COPY --from=build /app/apps/api/docker-entrypoint.sh ./docker-entrypoint.sh

ENV NODE_ENV=production
EXPOSE 3001

ENTRYPOINT ["./docker-entrypoint.sh"]

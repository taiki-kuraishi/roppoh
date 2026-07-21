# syntax=docker/dockerfile:1.25

# Bump together with @playwright/test in apps/neo-fujimatsu/package.json.
FROM mcr.microsoft.com/playwright:v1.61.1-noble

# Bump together with packageManager in root package.json (bun@1.3.12).
COPY --from=oven/bun:1.3.14 /usr/local/bin/bun /usr/local/bin/bun

WORKDIR /app

COPY package.json bun.lock bunfig.toml ./

COPY apps/emdash/package.json    ./apps/emdash/
COPY apps/neo-fujimatsu/package.json ./apps/neo-fujimatsu/
COPY apps/roppoh/package.json        ./apps/roppoh/
COPY apps/web-console/package.json   ./apps/web-console/

COPY packages/domain/package.json            ./packages/domain/
COPY packages/shadcn/package.json            ./packages/shadcn/
COPY packages/better-auth/package.json       ./packages/better-auth/
COPY packages/better-auth-query/package.json ./packages/better-auth-query/
COPY packages/oxlint-plugins/package.json    ./packages/oxlint-plugins/
COPY packages/grafana-dashboards/package.json ./packages/grafana-dashboards/

RUN bun install --frozen-lockfile

COPY . .

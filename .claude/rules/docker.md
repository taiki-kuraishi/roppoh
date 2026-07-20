---
paths:
  - ".docker/**"
---

# Docker イメージのルール

`.docker/` 配下の Dockerfile 群（`dev-pod` / `discord-gateway-proxy` / `playwright`）
共通のルール。各 Dockerfile の冒頭コメントも参照(ビルド方法・同期先が個別に書いてある)。

## ビルドコンテキストは常に repo root

すべての Dockerfile は**リポジトリルートをビルドコンテキスト**にしてビルドする。
`-f` で Dockerfile のパスを指定する:

```bash
docker build -f .docker/dev-pod/Dockerfile .
docker build -f .docker/discord-gateway-proxy/Dockerfile .
DOCKER_BUILDKIT=1 docker build -f .docker/playwright/Dockerfile -t roppoh-playwright:latest .
```

理由: 単一の root `go.mod` / `bun.lock` / 全 workspace の `package.json` を参照するため。
Dockerfile 内の `COPY` パスはすべて **repo root 相対**で書く(`COPY cmd ./cmd` など)。

## バージョンは必ず同期元を確認してから変更する

Dockerfile にハードコードされたベースイメージ/ツールのバージョンは、リポジトリ内の
別の場所が「正」になっている。**片方だけ変えると壊れる**ので、変更時は必ず両方を合わせる。

| Dockerfile 内のバージョン                       | 同期元(source of truth)                                 |
| ----------------------------------------------- | ------------------------------------------------------- |
| `discord-gateway-proxy`: `golang:X` builder     | `mise.toml` の `go = "..."`(= `go.mod` の go directive) |
| `playwright`: `mcr.microsoft.com/playwright:vX` | `apps/neo-fujimatsu/package.json` の `@playwright/test` |
| `playwright`: `oven/bun:X`                      | root `package.json` の `packageManager` (`bun@X`)       |

> 迷ったら該当 Dockerfile 冒頭のコメントに「Bump together with ...」と明記されている。

## `.dockerignore` の命名 — サブディレクトリでは `.dockerignore` は効かない

ビルドコンテキストが repo root なので、**デフォルトの `.dockerignore` は repo 直下**しか
参照されない。Dockerfile ごとに個別の ignore を持たせたいときは、
**`<Dockerfile名>.dockerignore` を Dockerfile の隣に置く**(BuildKit の機能)。

- ✅ `.docker/discord-gateway-proxy/Dockerfile.dockerignore` — Dockerfile 専用 ignore として BuildKit が拾う
- ❌ `.docker/discord-gateway-proxy/.dockerignore` — サブディレクトリの `.dockerignore` は**無視される**

そのため `Dockerfile.dockerignore` を `.dockerignore` にリネームしてはいけない。
この機能は **BuildKit 必須**(`DOCKER_BUILDKIT=1` または `docker buildx`)。

## あわせて確認

- workspace パッケージを増減したら `playwright/Dockerfile` の `COPY` 行を追従する
  (→ `.claude/rules/workspace-packages.md`)
- `dev-pod` イメージはツール類を焼き込まない方針(Nix + yadm bootstrap が展開)。
  `files/bin/` のスクリプトは `mise run test:unit:dev-pod`(bats)でテストされる

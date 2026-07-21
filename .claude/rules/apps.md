---
paths:
  - "apps/**"
---

# apps/ ルール — 1 アプリ = 1 デプロイ単位

`apps/*` は**デプロイ可能な単位**で分割する。各アプリは独立した Cloudflare Worker として
デプロイされ、それぞれ `wrangler.jsonc` と `deploy` スクリプトを持つ。

| App             | Stack                           | 構造(ディレクトリ)                | ディレクトリ定義                       |
| --------------- | ------------------------------- | --------------------------------- | -------------------------------------- |
| `neo-fujimatsu` | Vite + Hono/Inertia + CF Worker | `src/client/` + `src/server/`     | `neo-fujimatsu/directory-structure.md` |
| `web-console`   | Vite + Inertia + CF Worker      | `app/`(Inertia, PascalCase pages) | `web-console/directory-structure.md`   |
| `roppoh`        | Vite + Inertia + CF Worker      | `app/`(Inertia, PascalCase pages) | `roppoh/directory-structure.md`        |
| `emdash`        | Astro + CF Worker               | `src/`(Astro ファイルベース)      | `emdash/directory-structure.md`        |

- `neo-fujimatsu` の `src/client` のコンポーネント規約は
  `neo-fujimatsu/react-components.md`(oxlint で強制)。
- `web-console` / `roppoh`(Inertia/PascalCase)と `emdash`(Astro)はその規約の対象外。

## 新しいアプリを追加するとき

- **デプロイ単位として独立**させる(独自の `wrangler.jsonc` + `deploy` スクリプト)
- `package.json` 名は `@roppoh/<app>`、共有依存は root `catalog` を `"catalog:"` で参照
- `package.json` / `tsconfig.json` / `turbo.json` は近い既存アプリの構成に合わせる
- workspace 追加なので `.docker/playwright/Dockerfile` の COPY 行を追従(→ `workspace-packages.md`)
- そのアプリの `directory-structure.md` を `.claude/rules/<app>/` に追加する
- `deploy-cloudflare` workflow(`dorny/paths-filter`)にフィルタとデプロイジョブを追加する
  (→ `github-actions.md`)

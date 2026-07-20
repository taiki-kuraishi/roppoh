---
paths:
  - "apps/ura-roppoh/**"
---

# ura-roppoh — Directory Structure

`apps/ura-roppoh` は **`apps/roppoh` と同一のスタック・同一のディレクトリ構造**
(Vite + react-router ライブラリモード + Cloudflare Workers、`src/` 配下)。

- 構造・命名・ルーティングの詳細は **`roppoh/directory-structure.md`** をそのまま参照。
- コンポーネント規約(oxlint 強制)は **`roppoh/react-components.md`**(`**/*.tsx` が対象)。

## roppoh との違い / このアプリ固有

- 管理コンソール寄りのページを持つ: `src/pages/oidc-client/`, `src/pages/user/`,
  `src/pages/organization/` など(各ダイアログは `components/<dialog>/` にコロケーション)。
- それ以外(`main.tsx` / `router.ts` / `root/` / `layouts/sidebar-layout/` / `libs/` /
  `components/`)は roppoh と同じ並び。

## デプロイ

- `deploy` スクリプト → Cloudflare Worker(`wrangler deploy`)。1 アプリ = 1 デプロイ単位。

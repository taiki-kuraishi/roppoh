---
paths:
  - "apps/web-console/**"
---

# web-console — Directory Structure

`apps/web-console` は **Vite + Inertia** の管理コンソール。ソースは **`app/`** 配下
(roppoh 系の `src/` ではない)。**ページは Inertia 解決に合わせて PascalCase**。

## ディレクトリツリー

```text
apps/web-console/
├── app
│   ├── client.tsx               # クライアントエントリ
│   ├── server.ts                # サーバエントリ
│   ├── root-view.tsx            # ルートビュー
│   ├── global.css               # Tailwind エントリ
│   ├── pages/                   # Inertia ページ(PascalCase)
│   │   ├── Index.tsx
│   │   ├── Login/Index.tsx
│   │   ├── User/Index.tsx       # 各ページ配下に components/ をコロケーション
│   │   ├── OidcClient/Index.tsx
│   │   └── ...                  # Callback, Consent, Organization
│   ├── layouts/                 # compose.tsx, sidebar-layout/
│   ├── guards/                  # admin-guard.tsx, auth-guard.tsx
│   ├── providers/               # app-providers, error-boundary, query-client, theme-provider
│   ├── components/              # 共有コンポーネント(site-header など)
│   └── libs/                    # better-auth, nuqs-adapter など
│
├── e2e.playwright.config.ts     # e2e 設定
├── vrt.playwright.config.ts     # VRT 設定
├── wrangler.jsonc
├── vite.config.ts
└── package.json / tsconfig.json / turbo.json
```

## ルール(roppoh 系との違い)

- **ページは PascalCase**: `pages/User/Index.tsx` のように Inertia が
  `c.render('User/Index')` → `app/pages/User/Index.tsx` で解決する。
  そのため oxlint の `unicorn/filename-case`(kebab-case)は **`app/pages/**` だけ除外**されている
(`oxlint.config.ts`)。pages 以外(`components/`, `libs/` など)は kebab-case。
- **roppoh 系のカスタムルール(`roppoh/file-structure` など)の対象外**。`page.tsx` 固定や
  境界 import ルールは適用されない。
- プロバイダは `app/providers/`、認可は `app/guards/` に置く(roppoh の `root/components/` とは別構成)。

## デプロイ / テスト

- `deploy` → Cloudflare Worker(`bun run build` → `wrangler deploy`)。1 アプリ = 1 デプロイ単位。
- e2e: `mise run test:e2e:web-console` / VRT: `mise run test:vrt:web-console`。

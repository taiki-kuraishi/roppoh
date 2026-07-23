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
│   ├── root-view/                # index.tsx(ルートビュー) + components/react-refresh-preamble.tsx
│   ├── global.css               # Tailwind エントリ
│   ├── pages/                   # Inertia ページ(PascalCase)
│   │   ├── Index.tsx
│   │   ├── Login/Index.tsx
│   │   ├── User/Index.tsx       # 各ページ配下に components/ をコロケーション
│   │   ├── OidcClient/Index.tsx
│   │   └── ...                  # Callback, Consent, Organization
│   ├── layouts/                 # app-layout/, admin-layout/, sidebar-layout/
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

## ルール(roppoh と同じ)

- **ページは PascalCase**: `pages/User/Index.tsx` のように Inertia が
  `c.render('User/Index')` → `app/pages/User/Index.tsx` で解決する。
  そのため oxlint の `unicorn/filename-case`(kebab-case)は **`app/pages/**` だけ除外**されている
(`oxlint.config.ts`)。pages 以外(`components/`, `libs/` など)は kebab-case。
- **roppoh 系のカスタムルール**(`oxlint.config.ts` の `apps/web-console/app/**` override で有効化):
  - `roppoh/file-structure-inertia` — `pages/<PascalName>/Index.tsx` を強制(neo-fujimatsu 向けの
    `roppoh/file-structure` とは casing/エントリ名が逆なので別ルール)
  - `roppoh/no-cross-feature-import` — `<name>/components/` はその境界の外から import 禁止
    (ネストの全階層で最も内側の components が境界になる。トップレベル直下の `app/components/` は対象外)
  - `roppoh/prefer-alias-import` — 境界の外を参照するときは相対パスでなく `@/` を使う
  - `roppoh/one-function-per-tsx` — `.tsx` のトップレベル関数は 1 つまで(定数は無制限)
- プロバイダは `app/providers/`、認可は `app/guards/` に置く。

## デプロイ / テスト

- `deploy` → Cloudflare Worker(`bun run build` → `wrangler deploy`)。1 アプリ = 1 デプロイ単位。
- e2e: `mise run test:e2e:web-console` / VRT: `mise run test:vrt:web-console`。

---
paths:
  - "apps/neo-fujimatsu/**"
---

# neo-fujimatsu — Directory Structure

`apps/neo-fujimatsu` は **Hono サーバ + Inertia + React** の構成。`src/` の下が
**`server/`(Hono)と `client/`(React)に分かれる**のが最大の特徴。

## ディレクトリツリー

```text
apps/neo-fujimatsu/
├── src
│   ├── client/                  # React SPA
│   │   ├── main.tsx             # クライアントエントリ
│   │   ├── router.ts            # react-router(createBrowserRouter)
│   │   ├── global.css           # Tailwind エントリ
│   │   ├── root/                # プロバイダ + エラーバウンダリ
│   │   │   ├── index.tsx
│   │   │   └── components/      # アプリ全体プロバイダ(theme-provider など)
│   │   ├── pages/<name>/page.tsx# ページ(page.tsx 固定 + components/)
│   │   ├── layouts/             # レイアウト(authenticated-layout.tsx など)
│   │   └── libs/                # 外部ライブラリ setup(better-auth など)
│   │
│   └── server/                  # Hono サーバ
│       ├── entry.ts             # サーバエントリ
│       ├── server.ts            # Hono アプリ定義
│       ├── middlewares/         # index.ts で束ねる(better-auth-cors, DI など)
│       └── routes/              # ルート定義(index.ts で集約)
│           ├── .well-known/     # OIDC/OAuth ディスカバリ
│           ├── better-auth.ts
│           └── health.ts
│
├── wrangler.jsonc / wrangler.test.jsonc   # 本番 / テスト用 Worker 設定
├── playwright.config.ts                    # e2e
├── vite.config.ts / vitest.config.ts
└── package.json / tsconfig.json / turbo.json
```

## ルール

- **`src/client/` は roppoh 系のコンポーネント規約(oxlint)対象**
  (`react-components.md`。`@/...` エイリアスで境界外を import)。
- `src/server/` は Hono の慣例に従う。`routes/` は `index.ts` で集約、`middlewares/` も同様。
- クライアント/サーバ間で共有したい型・ロジックは、どちらかに寄せるか workspace パッケージへ。

## デプロイ

- `deploy` → Cloudflare Worker(`vite build` → `wrangler deploy`)。1 アプリ = 1 デプロイ単位。
- e2e は `mise run test:e2e:neo-fujimatsu`、VRT は `mise run test:vrt:neo-fujimatsu`。

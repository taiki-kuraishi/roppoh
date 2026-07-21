---
paths:
  - "apps/roppoh/**"
---

# roppoh — Directory Structure

`apps/roppoh` は **Vite + Inertia** の最小アプリ。ソースは **`app/`** 配下
(web-console と同じ構成)。**ページは Inertia 解決に合わせて PascalCase**。
認証・DB・状態管理は持たず、`/` に "Hello world" を出すだけの最小構成。

## ディレクトリツリー

```text
apps/roppoh/
├── app
│   ├── client.tsx               # クライアントエントリ(createInertiaApp)
│   ├── server.ts                # サーバエントリ(Hono + @hono/inertia)
│   ├── root-view.tsx            # ルートビュー(hono/jsx の HTML シェル)
│   ├── global.css               # Tailwind エントリ(shadcn なし)
│   └── pages/                   # Inertia ページ(PascalCase)
│       └── Index.tsx
│
├── test
│   ├── unit/health.test.ts      # bun test(app.request で /health を検証)
│   ├── e2e/index.spec.tsx       # Playwright e2e(振る舞い)
│   └── vrt/index/page.spec.tsx  # Playwright VRT(ビジュアル回帰)
│
├── e2e.playwright.config.ts     # e2e 設定
├── vrt.playwright.config.ts     # VRT 設定
├── wrangler.jsonc
├── vite.config.ts
└── package.json / tsconfig.json / turbo.json
```

## ルール(web-console と同じ)

- **ページは PascalCase**: Inertia が `c.render('Index')` → `app/pages/Index.tsx` で解決する。
  そのため oxlint の `unicorn/filename-case`(kebab-case)は **`app/pages/**` だけ除外**
(`oxlint.config.ts`)。pages 以外は kebab-case。
- **roppoh 系のカスタムルール(`roppoh/file-structure` など)の対象外**。
- 新しいナビゲーブルルートを足したら `wrangler.jsonc` の `assets.run_worker_first` に追記する
  (Inertia がルーティングを所有し static フォールバックが無いため。抜けると 404)。

## テスト

- **ユニット**: `bun test`(Cloudflare plugin / vitest 不要)。CF バインディングを持たない
  dumb renderer なので `app.request()` で in-process 実行する。`bun test ./test/unit` に
  スコープ限定(`*.spec.tsx` の Playwright テストを巻き込まないため。ユニットは `*.test.ts`)。
- **e2e**: `mise run test:e2e:roppoh`(ホスト実行、Docker 不要)。
- **VRT**: `mise run test:vrt:roppoh`(Docker コンテナ内。`-u` でスナップショット更新)。

## デプロイ

- `deploy` → Cloudflare Worker(`bun run build` → `wrangler deploy`)。1 アプリ = 1 デプロイ単位。
- custom domain: `roppoh.tsar-bmb.org`。

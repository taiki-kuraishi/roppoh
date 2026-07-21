---
paths:
  - "apps/roppoh/**"
---

# roppoh — Directory Structure

`apps/roppoh` は **Vite + Inertia** のアプリ。ソースは **`app/`** 配下
(web-console と同じ構成)。**ページは Inertia 解決に合わせて PascalCase**。
neo-fujimatsu(better-auth の OIDC/OAuth 認可サーバ)による認証を持つ。
認証は web-console と同じ **oauth4webapi ベースの public PKCE クライアント**で、
ガードは**すべてクライアントサイド**(Hono はセッションを見ない dumb Inertia renderer)。

## ディレクトリツリー

```text
apps/roppoh/
├── app
│   ├── client.tsx               # クライアントエントリ(ErrorBoundary > AppProviders > App)
│   ├── server.ts                # サーバエントリ(Hono + @hono/inertia)
│   ├── root-view.tsx            # ルートビュー(hono/jsx の HTML シェル)
│   ├── global.css               # Tailwind エントリ(+ @roppoh/shadcn)
│   ├── guards/                  # auth-guard.tsx(未ログインなら /login へ)
│   ├── layouts/                 # compose.tsx(appLayout = AuthGuard)
│   ├── providers/               # app-providers, theme-provider, error-boundary
│   └── pages/                   # Inertia ページ(PascalCase)
│       ├── Index.tsx            # ガード対象(Index.layout = appLayout)
│       ├── Login/Index.tsx      # 公開(.layout なし)
│       └── Callback/Index.tsx   # 公開(OIDC リダイレクト処理後 / へ)
│
├── test
│   ├── unit/health.test.ts      # bun test(app.request で /health を検証)
│   ├── helpers/                 # create-logged-in-user(oidc-client-ts storage を seed)
│   ├── e2e/index.spec.tsx       # Playwright e2e(AuthGuard の振る舞い)
│   └── vrt/{index,login}/       # Playwright VRT(ログイン済み / と /login)
│
├── e2e.playwright.config.ts     # e2e 設定
├── vrt.playwright.config.ts     # VRT 設定
├── wrangler.jsonc               # vars: VITE_OIDC_ISSUER / VITE_OIDC_CLIENT_ID
├── vite-env.d.ts                # import.meta.env(VITE_OIDC_*)の型
├── vite.config.ts               # dev port 51730(D1 の localhost redirect_uri と一致)
└── package.json / tsconfig.json / turbo.json
```

## 認証

- **フロー**: Authorization Code + PKCE。共有パッケージ **`@roppoh/oidc-client`**
  (`react-oidc-context` / `oidc-client-ts` のラッパ)が本体で、`app-providers.tsx` で
  `OidcAuthProvider`(issuer / clientId を渡す)を配置し、`useAuth()` を re-export する。
  PKCE・callback 処理・トークン保存はライブラリが担当(web-console と共通)。
- **ガード**: `app/guards/auth-guard.tsx` が `useAuth().isAuthenticated` を見て未ログインなら
  `/login` へ。ガード対象ページは `Index.layout = appLayout`(`app/layouts/compose.tsx`)を付ける。
  Login / Callback は公開ページ(`.layout` なし)。
- **設定**: `VITE_OIDC_ISSUER`(`https://neo-fujimatsu.tsar-bmb.org/api`)と
  `VITE_OIDC_CLIENT_ID` を `wrangler.jsonc` の `vars` と `.env.local` に置く(**public クライアントで secret なし**)。
  この `client_id` に対応する OAuth クライアントは neo-fujimatsu 側(認可サーバ)の D1(`roppoh-better-auth`)に
  **out-of-band で登録する運用**(リポジトリに seeder/SQL は無い。web-console の client も同様に vars にしか現れない)。
  想定 redirect_uri は `http://localhost:51730/callback` と `https://roppoh.tsar-bmb.org/callback`。
  dev port を 51730 に固定しているのはこの localhost redirect と一致させるため。登録内容を変更したら
  この記述も追従すること(DB の中身はリポジトリに無いため、静的には検証できない)。

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

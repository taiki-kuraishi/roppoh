---
paths:
  - "apps/emdash/**"
---

# emdash — Directory Structure

`apps/emdash` は **Astro** 製のコンテンツ/ブログサイト(Cloudflare Worker デプロイ)。
roppoh 系(React SPA)とは別スタックで、**Astro のファイルベースルーティング**に従う。

## ディレクトリツリー

```text
apps/emdash/
├── src
│   ├── pages/                   # Astro ファイルベースルーティング(.astro / .ts)
│   │   ├── index.astro
│   │   ├── 404.astro
│   │   ├── search.astro
│   │   ├── rss.xml.ts           # エンドポイント(.ts)
│   │   ├── posts/index.astro
│   │   ├── posts/[slug].astro   # 動的ルート
│   │   ├── pages/[slug].astro
│   │   ├── category/[slug].astro
│   │   └── tag/[slug].astro
│   ├── layouts/                 # Base.astro など(PascalCase)
│   ├── components/              # PostCard.astro / TagList.astro(PascalCase)
│   ├── styles/                  # theme.css
│   ├── utils/                   # reading-time.ts, site-identity.ts
│   ├── live.config.ts           # emdash live 設定
│   └── worker.ts                # Cloudflare Worker エントリ
│
├── astro.config.mts
├── emdash-env.d.ts
├── wrangler.jsonc
└── package.json / tsconfig.json / turbo.json
```

## ルール

- **命名は Astro 慣例**: `.astro` のコンポーネント/レイアウトは **PascalCase**
  (`PostCard.astro`, `Base.astro`)。`pages/` はルーティング名がそのままファイル名。
- **oxlint の対象外**: `oxlint.config.ts` の `ignorePatterns` で `apps/emdash` 全体を除外。
  roppoh 系のファイル名・構造ルールは適用されない。
- コンテンツ投入は `emdash` CLI(`bootstrap` = `emdash init && emdash seed`、`seed`)。
  CLI の使い方は `.claude/skills/emdash-cli` / `building-emdash-site` を参照。

## デプロイ

- `deploy` → `astro build && wrangler deploy`。1 アプリ = 1 デプロイ単位。
- `type-check` は `astro check`(他アプリの `tsc --noEmit` とは別)。

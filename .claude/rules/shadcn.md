---
paths:
  - "packages/shadcn/**"
---

# @roppoh/shadcn — 共有 UI(生成コード)

全アプリで共有する shadcn/ui コンポーネント。**shadcn CLI が生成するコードなので、
直接編集しない。**

## 生成物として扱う

- `src/components/ui/*` は **shadcn CLI で追加/更新する**(`components.json` の設定に従う)。
  手で書き換えず、CLI 経由で足す/上げる。
- 設定は `components.json`(style: `base-mira` / iconLibrary: lucide / css: `./src/global.css` /
  aliases は `@roppoh/shadcn/*` を指す)。
- そのため **oxlint 対象外**: `oxlint.config.ts` の `ignorePatterns` に `packages/shadcn/src` があり、
  リポジトリのコンポーネント規約(kebab-case, file-structure 等)は適用しない。

## 公開面(subpath exports)

`package.json` の `exports` で分割公開している。アプリからは bare specifier で import:

- `@roppoh/shadcn/components/*` → `src/components/*.tsx`(UI は `.../components/ui/button` など)
- `@roppoh/shadcn/global.css` → Tailwind エントリ
- `@roppoh/shadcn/hooks/*` → `src/hooks/*`
- `@roppoh/shadcn/lib/*` → `src/lib/*`(`.../lib/utils` の `cn` など)

## カスタマイズが必要なとき

- どうしても手を入れる必要がある場合も、まず CLI で足せないか・`lib`/`hooks` 側の
  ラッパーで対応できないかを検討する。`components/ui/` の直接改変は最終手段。

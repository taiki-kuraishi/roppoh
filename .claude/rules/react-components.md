---
paths:
  - "apps/**/*.tsx"
  - "!apps/**/*.spec.tsx"
---

# React Component Architecture & Patterns

対象: `apps/neo-fujimatsu`(`src/client/`)、`apps/roppoh`、`apps/web-console`
(ともに `app/`)。3 アプリ共通の React コンポーネント設計規約。`apps/emdash`(Astro)は対象外。

この規約の大部分は **oxlint で機械的に強制されている**(末尾の「Lint による強制」を参照)。

## アプリ別の差分早見表

| 項目                                   | neo-fujimatsu                          | roppoh / web-console                            |
| -------------------------------------- | -------------------------------------- | ----------------------------------------------- |
| ソースルート                           | `src/client/`                          | `app/`                                          |
| ページディレクトリの命名               | kebab-case                             | PascalCase(Inertia のページ解決に合わせる)      |
| ページエントリファイル名               | `page.tsx` 固定                        | `Index.tsx` 固定                                |
| ファイル名(pages 配下以外)             | kebab-case                             | kebab-case                                      |
| ディレクトリ型コンポーネントのエントリ | `index.tsx`                            | `index.tsx`                                     |
| カスタムフック                         | `use-*.ts`                             | `use-*.ts`                                      |
| `@/` エイリアスの実体                  | `./src/*`(import は `@/client/...`)    | `./app/*`(import は `@/...`)                    |
| 1 ファイル 150 行 / 1 関数 100 行制限  | あり                                   | なし                                            |
| ディレクトリ構造の詳細                 | `neo-fujimatsu/directory-structure.md` | `roppoh/`・`web-console/directory-structure.md` |

## コロケーション

コンポーネントは使う場所の近くに置く。

```text
pages/account/
├── page.tsx (neo-fujimatsu) / Index.tsx (roppoh, web-console)
└── components/
    ├── passkey-list-view.tsx        # 単一ファイルのコンポーネント
    └── add-passkey-dialog/          # 複数ファイルに分かれるコンポーネント
        ├── index.tsx
        └── components/              # さらに内部専用のコンポーネントをネスト可
            └── form.tsx
```

**境界ルール**: トップレベル直下の共有 `components/` を除き、`<name>/components/` はその境界(ネストしていれば最も内側の `components/`)の中からしか import できない。`root/components/`(アプリ全体のプロバイダ置き場)も例外ではない。

```
このコンポーネントは 2 つ以上の場所で使う?
  ├─ YES → src/components/ へ昇格する
  └─ NO  → 使う場所の components/ に置く
```

- `src/components/`(neo-fujimatsu)/ `app/components/`(roppoh, web-console) — 複数ページ/レイアウト/root で共有するコンポーネント(唯一の共有場所)

## Import 規約

- **同一境界内**(自分のページ/レイアウトの中)は相対 import 可: `./components/login-button`, `../../params`
- **境界をまたぐ**ときは `@/` エイリアスを使う(roppoh/web-console は `@/...`、neo-fujimatsu は `@/client/...`):

```typescript
// ✅ 境界の外は @/ エイリアス(roppoh, web-console の例。neo-fujimatsu は @/client/...)
import { betterAuth } from "@/libs/better-auth";
import { Header } from "@/components/header";

// ✅ 同一ページ内は相対パス
import { LoginButton } from "./components/login-button";

// ❌ 境界の外への相対パス
import { betterAuth } from "../../libs/better-auth";

// ❌ 他ページの components を import(共有するなら共有の components/ へ昇格)
import { ConsentButton } from "@/pages/consent/components/consent-button";

// ❌ root/components も例外なく境界化される(共有するなら共有の components/ へ昇格)
import { useAuth } from "@/root/components/auth-provider";
```

- workspace パッケージは bare specifier で import: `@roppoh/shadcn/components/ui/button`

## .tsx のトップレベル関数は 1 つまで

`.tsx` に定義できるトップレベル関数(コンポーネント/フック/ヘルパー)は 1 つまで(`roppoh/one-function-per-tsx`)。定数は無制限。2 つ目以降は別ファイルへ分割する。JSX を含まないファイルは `.ts` にする。

## サイズ制限(neo-fujimatsu のみ)

- **1 ファイル 150 行まで**(`max-lines`)
- **1 関数 100 行まで**(`max-lines-per-function`)

超えたらコンポーネント/フックを分割する。フィールド群は `components/` 配下へ、ロジックは `use-*.ts` カスタムフックへ抽出する。roppoh / web-console にはまだ導入されていない。

## Lint による強制

規約は root の `oxlint.config.ts` と `packages/oxlint-plugins`(カスタムプラグイン `roppoh`)で強制される。

| 規約                                   | ルール                           | 適用範囲                           |
| -------------------------------------- | -------------------------------- | ---------------------------------- |
| ファイル名 kebab-case                  | `unicorn/filename-case`          | リポジトリ全体(pages 配下除く)     |
| ディレクトリ名 kebab-case / pages 構造 | `roppoh/file-structure`          | neo-fujimatsu                      |
| pages/<PascalName>/Index.tsx 構造      | `roppoh/file-structure-inertia`  | roppoh, web-console                |
| コロケーション境界                     | `roppoh/no-cross-feature-import` | neo-fujimatsu, roppoh, web-console |
| 境界をまたぐ相対 import 禁止           | `roppoh/prefer-alias-import`     | neo-fujimatsu, roppoh, web-console |
| .tsx のトップレベル関数は 1 つまで     | `roppoh/one-function-per-tsx`    | neo-fujimatsu, roppoh, web-console |
| ファイル 150 行制限                    | `max-lines`                      | neo-fujimatsu                      |
| 関数 100 行制限                        | `max-lines-per-function`         | neo-fujimatsu                      |

カスタムルールの実装は `packages/oxlint-plugins/src/`、テストは `packages/oxlint-plugins/test/`(`*.spec.ts`)にある。ルールを変更したら `bun run --filter @roppoh/oxlint-plugins test` で検証すること。

## Related Documentation

- `.claude/rules/neo-fujimatsu/directory-structure.md` - neo-fujimatsu のディレクトリ構造
- `.claude/rules/roppoh/directory-structure.md` - roppoh のディレクトリ構造
- `.claude/rules/web-console/directory-structure.md` - web-console のディレクトリ構造
- `packages/oxlint-plugins/` - カスタムリントルールの実装

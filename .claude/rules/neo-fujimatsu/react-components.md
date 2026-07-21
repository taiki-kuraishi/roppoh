---
paths:
  - "**/*.tsx"
  - "!packages/shadcn/**"
---

# React Component Architecture & Patterns

React 系アプリ(`apps/neo-fujimatsu` の `src/client`)のコンポーネント規約。

この規約の大部分は **oxlint で機械的に強制されている**(末尾の「Lint による強制」を参照)。

## ディレクトリ構造

```text
apps/<app>/src/          # neo-fujimatsu のみ src/client/ 配下に同じ構造を持つ
├── main.tsx             # エントリポイント
├── router.ts            # ルーター定義(JSX を含まないため .ts)
├── root/                # アプリルート(プロバイダ・エラーバウンダリ)
│   ├── index.tsx
│   ├── error-boundary.tsx
│   └── components/      # アプリ全体プロバイダ(auth-provider, theme-provider など)
│       └── auth-provider/
│           ├── index.tsx
│           ├── provider.tsx
│           ├── context.ts
│           ├── constant.ts
│           └── use-auth.ts
├── pages/               # ページ(ルート単位)
│   └── <page-name>/
│       ├── page.tsx     # ページのエントリ(必須・この名前のみ)
│       ├── params.ts    # ルートパラメータなどの付随ファイル(.ts は自由)
│       └── components/  # このページ専用のコンポーネント
├── layouts/             # レイアウト
│   ├── authenticated-layout.tsx     # 単一ファイルのレイアウト
│   └── sidebar-layout/              # ディレクトリ型レイアウト
│       ├── index.tsx
│       └── components/
├── components/          # 複数ページ/レイアウトで共有するコンポーネント
└── libs/                # 外部ライブラリのセットアップ(better-auth など)
```

## 命名規則

| 対象                                   | 規則            | 例                                |
| -------------------------------------- | --------------- | --------------------------------- |
| ファイル名                             | kebab-case      | `login-button.tsx`, `use-auth.ts` |
| ディレクトリ名                         | kebab-case      | `sidebar-layout`, `create-dialog` |
| ページのエントリ                       | `page.tsx` 固定 | `pages/login/page.tsx`            |
| ディレクトリ型コンポーネントのエントリ | `index.tsx`     | `create-dialog/index.tsx`         |
| カスタムフック                         | `use-*.ts`      | `use-auth.ts`                     |

- `pages/` 直下にファイルは置けない。必ず `pages/<name>/` ディレクトリを作る
- `pages/<name>/` 直下の `.tsx` は `page.tsx` のみ。`.ts`(`params.ts`, `types.ts`, `constant.ts` など)は自由
- かつて使われていた Container/Presenter(`-container.tsx` / `-view.tsx`)パターンは**廃止**

## コロケーション

コンポーネントは使う場所の近くに置く。

```text
pages/account/
├── page.tsx
└── components/
    ├── passkey-list-view.tsx        # 単一ファイルのコンポーネント
    └── add-passkey-dialog/          # 複数ファイルに分かれるコンポーネント
        ├── index.tsx
        └── components/              # さらに内部専用のコンポーネントをネスト可
            └── form.tsx
```

**境界ルール**: `pages/<name>/components/` と `layouts/<name>/components/` は、その境界の中からしか import できない。

```
このコンポーネントは 2 つ以上のページ/レイアウトで使う?
  ├─ YES → src/components/ へ昇格する
  └─ NO  → 使うページ/レイアウトの components/ に置く
```

- `src/components/` — 複数ページ/レイアウトで共有するコンポーネント
- `src/root/components/` — アプリ全体のプロバイダ(auth-provider, theme-provider)。どこからでも import 可

## Import 規約

- **同一境界内**(自分のページ/レイアウトの中)は相対 import 可: `./components/login-button`, `../../params`
- **境界をまたぐ**ときは `@/` エイリアスを使う(neo-fujimatsu は `@/client/...`):

```typescript
// ✅ 境界の外は @/ エイリアス
import { betterAuth } from "@/libs/better-auth";
import { useAuth } from "@/root/components/auth-provider";

// ✅ 同一ページ内は相対パス
import { LoginButton } from "./components/login-button";

// ❌ 境界の外への相対パス
import { betterAuth } from "../../libs/better-auth";

// ❌ 他ページの components を import(共有するなら src/components/ へ昇格)
import { ConsentButton } from "@/pages/consent/components/consent-button";
```

- workspace パッケージは bare specifier で import: `@roppoh/shadcn/components/ui/button`

## サイズ制限

- **1 ファイル 150 行まで**(`max-lines`)
- **1 関数 100 行まで**(`max-lines-per-function`)
- **.tsx のトップレベル関数は 1 つまで**(`roppoh/one-function-per-tsx`)。定数は無制限。2 つ目以降のコンポーネント/フック/ヘルパーは別ファイルへ分割する。JSX を含まないファイルは `.ts` にする

超えたらコンポーネント/フックを分割する。フィールド群は `components/` 配下へ、ロジックは `use-*.ts` カスタムフックへ抽出する。

## Lint による強制

規約は root の `oxlint.config.ts` と `packages/oxlint-plugins`(カスタムプラグイン `roppoh`)で強制される。

| 規約                                   | ルール                           | 適用範囲       |
| -------------------------------------- | -------------------------------- | -------------- |
| ファイル名 kebab-case                  | `unicorn/filename-case`          | リポジトリ全体 |
| ディレクトリ名 kebab-case / pages 構造 | `roppoh/file-structure`          | neo-fujimatsu  |
| コロケーション境界                     | `roppoh/no-cross-feature-import` | neo-fujimatsu  |
| 境界をまたぐ相対 import 禁止           | `roppoh/prefer-alias-import`     | neo-fujimatsu  |
| .tsx のトップレベル関数は 1 つまで     | `roppoh/one-function-per-tsx`    | neo-fujimatsu  |
| ファイル 150 行制限                    | `max-lines`                      | neo-fujimatsu  |
| 関数 100 行制限                        | `max-lines-per-function`         | neo-fujimatsu  |

カスタムルールの実装は `packages/oxlint-plugins/src/`、テストは `packages/oxlint-plugins/test/`(`*.spec.ts`)にある。ルールを変更したら `bun run --filter @roppoh/oxlint-plugins test` で検証すること。

## Related Documentation

- `.claude/rules/neo-fujimatsu/directory-structure.md` - neo-fujimatsu のディレクトリ構造
- `packages/oxlint-plugins/` - カスタムリントルールの実装

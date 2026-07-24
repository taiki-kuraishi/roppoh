---
paths:
  - "packages/**"
---

# packages/ 共通ルール

`packages/*` は `apps/*` から共有される内部ライブラリ。**ソース直参照**が基本
(バンドルしない)。

## 共通規約

- パッケージ名は **`@roppoh/<name>`**、`private` な workspace パッケージ。
- **`exports` は `./src/*.ts` を直接指す**(ビルド成果物ではなくソースを公開する)。
  必要なら subpath exports で公開面を分ける(例: `better-auth-query` の `./query` `./mutation`、
  `shadcn` の `./components/*`)。
  - 例外: `event-schemas` のような **codegen 専用**パッケージ(TS として import されず、生成物が
    ファイル経由で消費される)は `exports` を持たなくてよい。TS 消費者ができたら追加する。
- アプリからは **bare specifier** で import する(`@roppoh/shadcn/components/ui/button` など)。
- 共有依存のバージョンは root `package.json` の `catalog` に集約し、`"catalog:"` 参照にする。
- 全パッケージに **`type-check`(`tsc --noEmit`)** がある。ビルドが要るのは JSON を生成する
  `grafana-dashboards`(`build` = `generate.ts`)だけ。
- 新パッケージの `package.json` / `tsconfig.json` / `turbo.json` は既存パッケージに合わせ、
  workspace 追加手順(`.docker/playwright/Dockerfile` の COPY)を踏む(→ `workspace-packages.md`)。

## パッケージ一覧

| Package              | 役割                                                     | 個別ルール                                  |
| -------------------- | -------------------------------------------------------- | ------------------------------------------- |
| `better-auth`        | better-auth サーバ設定 + DB schema                       | `packages/better-auth/better-auth.md`       |
| `better-auth-query`  | better-auth 用 TanStack Query フック                     | —                                           |
| `event-schemas`      | proto→TS/Go/JSON codegen(R2 Data Catalog イベント)       | → `proto.md`                                |
| `oidc-client`        | 公開 SPA 用 OIDC クライアント(react-oidc-context ラッパ) | —                                           |
| `shadcn`             | shadcn/ui 共有 UI(生成コード)                            | `packages/shadcn/shadcn.md`                 |
| `grafana-dashboards` | TS→Grafana JSON 生成器                                   | → `k8s.md`                                  |
| `oxlint-plugins`     | カスタム oxlint ルール                                   | `packages/oxlint-plugins/oxlint-plugins.md` |
| `domain`             | 共有ドメイン層 **(廃止予定)**                            | —(新規利用しない)                           |

- `oxlint-plugins` を変更したら `bun run --filter @roppoh/oxlint-plugins test` で検証する。
- `domain` は廃止予定。新しく依存を増やさない。

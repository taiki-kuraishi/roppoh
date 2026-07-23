---
paths:
  - "packages/better-auth/**"
---

# @roppoh/better-auth — 認証 & DB スキーマ

better-auth のサーバ設定と、そこから生成される Drizzle スキーマ・D1 マイグレーションを
持つパッケージ。**スキーマとマイグレーションは生成物**。

## 生成フロー(手編集しない)

```text
src/auth.ts            # ← ここを編集する(better-auth の設定 = source of truth)
   │  bun run generate:schema   (@better-auth/cli generate)
   ▼
src/auth-schema.ts     # ← 生成物。手で編集しない
   │  bun run generate:migration (drizzle-kit generate)
   ▼
src/migrations/*.sql   # ← 生成物。手で編集しない(timestamp prefix)
```

- **`auth-schema.ts` を直接編集しない**。認証まわりの変更は `src/auth.ts` を直し、
  `bun run --filter @roppoh/better-auth generate:schema` で再生成する。
- スキーマを変えたら `generate:migration` で `src/migrations/` に SQL を生成してコミットする。
- drizzle 設定は `drizzle.config.ts`(dialect: sqlite / casing: snake_case / out: `./src/migrations`)。

## マイグレーションの適用先(Cloudflare D1)

- マイグレーション SQL は各アプリの `wrangler.jsonc` が **`migrations_dir`** で参照する
  (例: neo-fujimatsu → `../../packages/better-auth/src/migrations`)。
- 適用は wrangler の D1 マイグレーション機構(`wrangler d1 migrations apply ...`)で行う。
- 初期データ(super-admin など)は `src/seeder/*.sql`。

## 使う側

- アプリ/クエリパッケージからは `@roppoh/better-auth` を bare specifier で import。
- クライアント側のデータ取得は `@roppoh/better-auth-query`(TanStack Query フック)を使う。

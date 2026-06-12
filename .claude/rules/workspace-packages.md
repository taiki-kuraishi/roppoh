# Workspace パッケージ増減時のルール

workspace パッケージ(`apps/*`, `packages/*`)を**追加・削除・リネームした場合は、必ず `.docker/playwright/Dockerfile` の COPY 行を追従修正する**こと。

VRT 用コンテナは Docker レイヤーキャッシュのために全 workspace の `package.json` を個別 COPY してから `bun install --frozen-lockfile` を実行している:

```dockerfile
COPY packages/better-auth/package.json       ./packages/better-auth/
COPY packages/better-auth-query/package.json ./packages/better-auth-query/
```

## 怠った場合の症状

ホスト側の `bun install` や `mise run lint` は通るが、`mise run test`(`test:vrt:build-container`)がコンテナ内で失敗する:

```
error: Workspace dependency "@roppoh/xxx" not found
error: @roppoh/xxx@workspace:* failed to resolve
```

## 検証

```bash
mise run test:vrt:build-container
```

## あわせて確認

- 共有依存のバージョンは root `package.json` の `catalog` に集約し、`"catalog:"` 参照にする
- 新パッケージの `package.json` / `tsconfig.json` / `turbo.json` は既存パッケージ(`packages/better-auth-query` など)の構成に合わせる

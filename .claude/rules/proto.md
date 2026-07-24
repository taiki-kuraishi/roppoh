---
paths:
  - "proto/**"
  - "buf.yaml"
---

# Proto スキーマ SoT ルール(`proto/**`)

R2 Data Catalog / Cloudflare Pipelines のイベントスキーマは `.proto` を**唯一の真実の源 (SoT)**
とする。人間が編集するのは `proto/roppoh/events/v1/*.proto` だけで、そこから
`packages/event-schemas`(→ `packages.md`)の生成器が Terraform / Go / Iceberg 各ターゲットを生成する。

## 原則

- **フィールド番号 = Iceberg フィールド ID**。採番後は不変・使い回し禁止。削除は `reserved` で封印する。
- スキーマ変更は `.proto` だけで行う。生成物(`packages/event-schemas/src/roppoh/events/v1/*.gen.*`)は
  **自動生成・コミット対象・手編集禁止**。
- Cloudflare 固有のマッピングはカスタムオプションで表現する
  (`table` / `namespace` / `logical_type` / `pipelines_required` — `proto/roppoh/events/v1/options.proto`)。

## 変更したら

```bash
mise run proto:gen   # buf build → gen.ts で生成物を再生成
```

生成物をコミットし忘れると `proto-ci.yml` の drift ジョブ(`git diff --exit-code`)で落ちる
(`dashboard-drift-ci` と同じ「ソースから生成 → コミット必須」パターン)。

## ガバナンス(`buf`)

- `buf.yaml`(リポジトリルート): `lint: STANDARD` / `breaking: FILE`。
- `proto-ci.yml` の `proto` ジョブは `bufbuild/buf-action` を呼ぶだけ。この action は PR で
  `build` / `lint` / `format` / `breaking`(PR のベースブランチ比較)を既定で実行し、結果を PR に
  summary コメントする。これで番号再利用・型変更・required 化などの破壊的変更をマージ前に落とす
  (`permissions: pull-requests: write` はこのコメント投稿のため)。
- buf は mise 管理(`mise.toml` の `buf`)。CI(`bufbuild/buf-action`)の `version` も同じ値に固定する
  (片方だけ上げるとローカルと CI が食い違う)。

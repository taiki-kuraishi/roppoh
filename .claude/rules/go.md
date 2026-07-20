---
paths:
  - "**/*.go"
  - "go.mod"
  - "go.sum"
---

# Go ルール(`cmd/` / `internal/`)

リポジトリ内の Go コードは**単一の root `go.mod`**(module
`github.com/tsar-org/roppoh`)で管理する 1 モジュール構成。

## プロジェクトレイアウト

```text
cmd/
└── <binary>/                 # 実行可能バイナリ 1 つ = 1 ディレクトリ
    ├── main.go               # エントリポイント(package main)
    ├── README.md
    └── internal/             # その binary 専用のロジック(他から import 不可)
        ├── config/
        ├── gateway/
        ├── handler/
        └── pipeline/
internal/                     # repo 全体で共有する internal パッケージ
└── telemetry/
```

- **新しいバイナリは `cmd/<name>/main.go` を切る**(`package main`)。
- そのバイナリだけで使うロジックは `cmd/<name>/internal/<pkg>/` に置く
  (Go の `internal/` 可視性ルールで外部からの import が禁止される)。
- **複数バイナリで共有**するコードは repo root の `internal/<pkg>/` に置く。
- import パスは module 名基準: `github.com/tsar-org/roppoh/internal/telemetry` など。

## テストはコロケーション(Go の標準)

- テストは `foo_test.go` を **`foo.go` と同じディレクトリ・同じパッケージ**に置く
  (Go の慣例。`_test.go` はビルド時に本番バイナリから除外される)。
- 実行は `go test ./...`(CI の `go-ci` でも `parallel:` 内で回る)。
- テスト用のフェイク/ヘルパーも同ディレクトリに `*_test.go` として置く(例: `fake_test.go`)。

## 環境変数は sops 管理

- 秘匿値は sops で暗号化した `.env.sops.yaml` として置く(`cmd/<name>/.env.sops.yaml`)。
- 復号/暗号化は mise タスク: `mise run env-decrypt` / `mise run env-encrypt`。
- ローカル実行は `dotenvx run -- go run .`(`mise run dev:cmd:<name>` がこれを呼ぶ)。
- 復号済みの `.env` はコミットしない。

## Go バージョンは同期する

Go のバージョンは **`mise.toml` の `go = "..."` と `go.mod` の `go` ディレクティブを一致**
させる(Dockerfile の builder イメージも同じ → `docker.md`)。片方だけ上げると CI/ビルドが
食い違う。

> ⚠️ 現状ズレている: `mise.toml` = `1.26.5` / `go.mod` = `1.26.4`。次に触るとき合わせること。

## Lint / Build

- `mise run lint:go` = `golangci-lint run`(設定 `.golangci.yml`)→ `go build ./...`。
- `golangci-lint` のバージョンも `mise.toml` で固定。

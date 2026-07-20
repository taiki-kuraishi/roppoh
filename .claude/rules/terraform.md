---
paths:
  - "infra/**"
---

# Terraform ルール(`infra/`)

Cloudflare をプロビジョニングする Terraform。**デプロイ先ごとに env を分割**し、
共通ロジックはモジュール化する構成。

## レイアウト

```text
infra/
├── env/
│   └── prod/                 # デプロイ先ごとの root(apply する単位)
│       ├── backend.tf        # state バックエンド
│       ├── provider.tf       # provider 設定(Cloudflare)
│       ├── version.tf        # required_version / required_providers
│       ├── variables.tf
│       ├── outputs.tf
│       ├── main.tf           # modules を呼び出す
│       ├── mise.toml         # この env 用の mise 設定
│       ├── .tflint.hcl
│       └── .env.sops.yaml    # 秘匿値(sops)
└── modules/
    └── <name>/               # 再利用モジュール(api-token, d1, dns, kv, r2, ...)
        ├── main.tf
        ├── variables.tf
        ├── output.tf
        └── version.tf
```

## 1. env はデプロイ先ごとに分ける

- `infra/env/<env>/` が **apply する root 単位**。デプロイ先(環境)ごとに分ける
  (例: `prod`、将来 `dev` など)。
- 新しいデプロイ先を足すときは **`infra/env/<env>/` を切る**(既存 `prod` の構成に合わせる)。
- `infra/modules/<name>/` を各 env の `main.tf` から呼び出して共有する。

## 2. モジュールのファイル分割規約

各モジュール/root は関心ごとにファイルを分ける:

- `main.tf` — リソース定義
- `variables.tf` — 入力変数
- `output.tf`(root は `outputs.tf`)— 出力
- `version.tf` — `required_version` / `required_providers`

肥大化したら **関心事でファイルを分割**する(例: `zero-trust` モジュールは
`access-applications.tf` / `access-service-tokens.tf` / `tunnel.tf` に分けている)。

## 3. プロバイダ / バージョン

- プロバイダは **Cloudflare**。バージョンは各 `version.tf` の `required_providers` で pin。
- **`.terraform.lock.hcl` はコミットする**(プロバイダハッシュを固定)。
- Terraform 本体のバージョンは `mise.toml` で固定。

## 4. secrets は sops

- 秘匿値は `infra/env/<env>/.env.sops.yaml`(sops 暗号化)。復号済み `.env` はコミットしない。
- `mise run env-decrypt` / `env-encrypt` で扱う(Go と同じ運用 → `go.md`)。
- init/plan/apply は `sops exec-env .env.sops.yaml 'terraform ...'` 経由で秘匿値を注入する。

## 5. 実行 / lint

- terraform コマンドは **`infra/env/<env>/`(現状 `prod`)を working directory** にして実行。
- `terraform init` は `mise run install`(`install:terraform:prod`)で実施済み前提。
- lint(`mise run lint:terraform` / CI の `terraform-ci`):
  `terraform fmt -check -recursive`(`infra` 全体)→ `terraform validate` → `tflint`。
- **コミット前に `terraform fmt`** をかける(fmt チェックは CI で落ちる)。

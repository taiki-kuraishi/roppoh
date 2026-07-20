---
paths:
  - ".github/**"
---

# GitHub Actions (CI/CD) ルール

`.github/workflows/` と `.github/actions/` の規約。

## 1. CI 分割の粒度は user に相談する

ドメイン別に workflow を分けている(`bun-ci` / `go-ci` / `k8s-ci` / `terraform-ci` /
`dev-pod-ci` / `dashboard-drift-ci` / `deploy-cloudflare` + 全体の `ci.yml`)。

- **workflow を新設・統合・分割するときは、粒度を勝手に決めず必ず user に相談する。**
- 各 workflow は `pull_request.paths:` フィルタで、関係するファイルが変わったときだけ走る。
  対象領域を足したら **`paths:` フィルタも追従**する(自分自身の workflow ファイルや、
  依存する `.github/actions/setup-*/**`・`mise.toml` もフィルタに含める)。

## 2. 共通セットアップは composite action に切り出す

環境セットアップの重複は `.github/actions/<name>/action.yml`(composite action)に
まとめ、workflow からは `uses: ./.github/actions/<name>` で呼ぶ。

既存: `setup-bun` / `setup-go` / `setup-playwright` / `setup-turbo`。

- 複数 workflow で同じセットアップ手順を書きそうになったら、まず composite action 化を検討する。
- インライン `uses: jdx/mise-action@v4` を直接使っている workflow もある(k8s/terraform 等)。
  セットアップが単純な場合はそれでよいが、手順が増えたら composite action に寄せる。

## 3. 並列可能なステップは `parallel:` でまとめる

**互いに独立したステップは、順次実行せず `parallel:` で束ねて並列化する。**

```yaml
steps:
  - uses: ./.github/actions/setup-go
  - parallel:
      - run: golangci-lint run
      - run: go build ./...
      - run: go test ./...
```

- lint / type-check / build / test のように依存関係のない検証は `parallel:` に入れる。
- 依存があるもの(例: `terraform init` → `validate`)は並列化しない。

> ⚠️ `parallel:` は GitHub Actions の標準構文ではない。リポジトリ独自の記法で、
> 展開する仕組みは `.github/` 内には見当たらなかった(外部ツール/ジェネレータ想定)。
> 記法の詳細・展開方法を変更するときは仕組みを確認してから触ること。

## 参考: 既存の CI パターン

- **バージョン固定**: `actions/checkout@v7`, `jdx/mise-action@v4`, `docker/build-push-action@v7` など、
  サードパーティ action はメジャータグで固定する。
- **`timeout-minutes` 必須**: 全ジョブに設定(lint 系 5 分、docker/deploy 系 10〜15 分が目安)。
- **`permissions:`**: 読み取りだけで済むワークフローは `permissions: { contents: read }` を明示。
- **Docker ビルド**: `docker/build-push-action` + GitHub Actions cache
  (`cache-from/to: type=gha,scope=<name>`)。context は repo root、`file:` で Dockerfile 指定。
- **選択的デプロイ**: `deploy-cloudflare` は `dorny/paths-filter` で変更のあったアプリだけ
  `changes` ジョブの outputs 経由で deploy する(`needs: changes` + `if:`)。
- **ドリフト検証**: `dashboard-drift-ci` は生成物(`k8s/monitoring/dashboards/*.json`)を
  再生成して `git diff --exit-code` でコミット漏れを検知する(生成元は
  `packages/grafana-dashboards`)。同種の「ソースから生成 → コミット必須」物を足したら同じ検証を付ける。

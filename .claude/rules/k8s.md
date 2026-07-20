---
paths:
  - "k8s/**"
---

# Kubernetes (GitOps) ルール(`k8s/`)

**ArgoCD app-of-apps + Kustomize + KSOPS** による GitOps 構成。クラスタの状態は
`k8s/` の宣言と一致し、ArgoCD が同期する。

## 1. ワークロード追加手順(app-of-apps)

新しいワークロードを足すときは 3 点セットで:

1. **`k8s/<name>/`** を作る(`kustomization.yaml` + マニフェスト群)
2. **`k8s/argocd/apps/<name>.yaml`**(ArgoCD `Application`)を追加し、`k8s/<name>/` を指す
3. **`k8s/argocd/apps/kustomization.yaml`** の `resources:` に `<name>.yaml` を登録

3 のどれかを忘れると ArgoCD がデプロイしない/検知しない。

## 2. Kustomize 前提

- 各ワークロードディレクトリは `kustomization.yaml` を持つ(`resources` / `patches` /
  `configMapGenerator` などで構成)。
- 部分リソースの上書きは `patches/` に置く。`patches/` は kubeconform 対象外(6 参照)。

## 3. `<name>-build` は Argo CronWorkflow

イメージビルドは `k8s/<name>-build/cronworkflow.yaml`(Argo Workflows の
`CronWorkflow`)で定期実行する(例: `dev-pod-build`, `discord-gateway-proxy-build`)。
build 対象と実行体(ワークロード本体)はディレクトリを分ける。

## 4. secrets は KSOPS / sops

- 秘匿値は `k8s/secrets/` 配下に **sops 暗号化**して置き、`ksops-generator.yaml` で生成する。
- 復号は **ArgoCD repo-server** が行う(patch `argocd/patches/argocd-repo-server-sops.yaml`)。
- **平文の Secret をコミットしない**。ワークロードごとに `k8s/secrets/<name>/` を持つ。

## 5. Grafana dashboards は生成物(直接編集しない)

- `k8s/monitoring/dashboards/*.json` は **`packages/grafana-dashboards` の TypeScript から生成**
  される成果物。**JSON を直接編集しない**。
- 変更は TS ソースを直し、`bun run --filter @roppoh/grafana-dashboards build` で再生成して
  コミットする(`dashboard-drift-ci` がドリフトを検知する → `github-actions.md`)。

## 6. lint と除外パターン

`mise run lint:k8s`(CI の `k8s-ci`)= `kubeconform` → `kube-linter`。
kubeconform は以下を **k8s マニフェストではない**ため除外している:

- `patches/` — Kustomize の strategic-merge patch(部分リソースで必須フィールド欠落)
- `dashboards/` — 生成された Grafana JSON(k8s リソースではない)
- `files/` — `configMapGenerator` のソース(生の設定ファイル)

新たに「マニフェストではない YAML/JSON」を足すときは、同じ理由で除外パターン追加を検討する。

## 7. 外部公開するときは Terraform を必ず追従する

ワークロードを**クラスタ外部に公開**する(インターネット/Zero Trust 経由でアクセス可能にする)
ときは、k8s マニフェストだけでは不十分。**`infra/`(Terraform)側も更新**する(→ `terraform.md`):

- **DNS** — `infra/modules/dns`(公開ホスト名のレコード)
- **Tunnel** — `infra/modules/zero-trust/tunnel.tf`(cloudflared トンネルの ingress/経路)
- **Application ポリシー** — `infra/modules/zero-trust/access-applications.tf`
  (Zero Trust Access アプリケーション/アクセスポリシー)

この 3 つを更新しないと、公開したつもりでも到達できない/認可が効かない。

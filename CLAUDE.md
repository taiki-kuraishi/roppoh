# Claude Code Configuration

モノレポ (roppoh) 向けのプロジェクトルール・コンテキスト。

## Rules

### 常に読み込む(@import)

毎回参照する横断ルール。`paths:` を持たず、ここで `@import` して常時ロードする。

- @.claude/rules/conventions.md — ツール・環境 (Bun, mise, oxfmt/oxlint)
- @.claude/rules/mise-tasks.md — Mise タスクリファレンス
- @.claude/rules/turbo.md — Turbo タスクリファレンス
- @.claude/rules/workspace-packages.md — workspace パッケージ増減時の必須手順

### paths スコープ(該当ファイル編集時に読む)

先頭の `paths:` frontmatter にマッチするファイルを触るときだけ参照する。
ここには `@import` しない(常時ロードを避けるため)。

- `.claude/rules/docker.md` — `.docker/**`
- `.claude/rules/github-actions.md` — `.github/**`
- `.claude/rules/apps.md` — `apps/**`(1 アプリ = 1 デプロイ単位)
- `.claude/rules/neo-fujimatsu/directory-structure.md` — `apps/neo-fujimatsu/**`
- `.claude/rules/web-console/directory-structure.md` — `apps/web-console/**`
- `.claude/rules/roppoh/directory-structure.md` — `apps/roppoh/**`
- `.claude/rules/emdash/directory-structure.md` — `apps/emdash/**`
- `.claude/rules/go.md` — `**/*.go`, `go.mod`, `go.sum`(`cmd/` / `internal/`)
- `.claude/rules/terraform.md` — `infra/**`
- `.claude/rules/k8s.md` — `k8s/**`
- `.claude/rules/packages.md` — `packages/**`
- `.claude/rules/better-auth.md` — `packages/better-auth/**`
- `.claude/rules/shadcn.md` — `packages/shadcn/**`
- `.claude/rules/skills.md` — `.claude/skills/**`, `.agents/skills/**`
- `.claude/rules/neo-fujimatsu/react-components.md` — `**/*.tsx`(`packages/shadcn` 除く)

## コード修正後

必ず以下を実行:

```bash
mise run format
mise run lint
```

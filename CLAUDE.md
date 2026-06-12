# Claude Code Configuration

モノレポ (roppoh) 向けのプロジェクトルール・コンテキスト。

## Rules

- @.claude/rules/conventions.md — ツール・環境 (Bun, Turbo)
- @.claude/rules/mise-tasks.md — Mise タスクリファレンス
- @.claude/rules/turbo.md — Turbo タスクリファレンス
- @.claude/rules/workspace-packages.md — workspace パッケージ増減時の必須手順
- @.claude/rules/roppoh/directory-structure.md — `apps/roppoh` のディレクトリ構造
- @.claude/rules/roppoh/react-components.md — React コンポーネントパターン

## コード修正後

必ず以下を実行:

```bash
mise run format
mise run lint
```

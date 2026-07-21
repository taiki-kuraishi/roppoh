---
description: 変更差分に関連するドキュメント(README/CLAUDE.md/rules/skills/AGENTS.md)が実装と乖離していないかレビューする
argument-hint: "[ベースブランチ名(省略時は main)]"
allowed-tools: Task
---

`doc-drift-reviewer` サブエージェントを使って、今回の変更差分に関連するドキュメントが
実装と乖離していないかレビューしてください。

- ベースブランチ: $ARGUMENTS(空の場合は `main` を使う)
- 対象は差分に関連するドキュメントのみ(README / CLAUDE.md / .claude/rules / .claude/skills / AGENTS.md)。
- サブエージェントの報告(乖離あり / 要確認 / 問題なし)をそのまま提示すること。
- この時点では修正は行わず、指摘と修正提案までに留める。

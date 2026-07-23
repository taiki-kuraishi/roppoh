---
description: 現在の変更を commit → push → GitHub PR 作成 → CI監視まで自動で行う
allowed-tools: Task
---

`pr-creator` サブエージェントを使って、現在の変更を commit → push → GitHub PR 作成 → CI監視まで
一貫して実行してください。

- commit メッセージは英語1行、`<gitmoji> <prefix>: <message>` 形式(`commit` skill と同じ規約)。
  無関係な変更が混在する場合は分割を提案する。
- PR のタイトル・本文は英語、タイトルには gitmoji を付与する(https://gitmoji.dev/)。本文は
  `.github/pull_request_template.md` の構成に従う。
- push は `-u origin <ブランチ>`。force push はしない。
- PR 作成後は `gh pr checks --watch` で CI 完了まで監視する。
- CI が失敗した場合は、失敗したジョブ名と URL のみを報告させ、ログの要約・原因分析はさせない。
- サブエージェントの最終報告(PR URL・CI結果)をそのまま提示すること。

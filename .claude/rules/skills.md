---
paths:
  - ".claude/skills/**"
  - ".agents/skills/**"
---

# Skills の置き場と同期

スキルの**実体は `.claude/skills/`** に置く(各スキルは `<name>/SKILL.md`)。

pi など `.agents/skills` を読むエージェント向けに、**`.agents/skills` は
`.claude/skills` へのシンボリックリンク**にしている:

```text
.agents/skills -> ../.claude/skills   (相対 symlink)
```

- Claude Code は `.claude/skills`、pi は `.agents/skills`(→ 同じ実体)を読むので**常に同一内容**。
- スキルの追加・編集は **`.claude/skills/` 側だけ**行えばよい(両方に反映される)。
- symlink は git にコミットされる。壊れた/消えた場合は再作成する:

  ```bash
  mkdir -p .agents && ln -s ../.claude/skills .agents/skills
  ```

> Windows で clone する場合は `git config core.symlinks true` が必要
> (現状は Mac/Linux 運用前提)。

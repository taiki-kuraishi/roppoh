---
name: commit
description: Create a git commit from current changes. Commit message is a single line in English with gitmoji emoji, formatted as "<gitmoji> <prefix>: <message>". No commit body/description. Use when ready to commit staged or unstaged changes.
---

# Create Git Commit

This skill automates the commit process by:

1. **Analyzing the current changes** — runs `git status` and `git diff` to understand what changed
2. **Generating the commit message** — creates a single-line message in English following the format below
3. **Staging and committing** — stages the relevant files and creates the commit

## Commit Message Format

```
<gitmoji> <prefix>: <message>
```

- **gitmoji** — an emoji matching the nature of the change (see Gitmoji Reference below)
- **prefix** — a conventional commit type: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`
- **message** — concise description in English, imperative mood, lowercase, no trailing period

## Gitmoji Reference

This skill uses emojis from [gitmoji.dev](https://gitmoji.dev/) specification. Please refer to https://gitmoji.dev/ for the complete emoji reference and guidelines.

## Rules

- Commit message is written in **English only**
- **Single line only** — no commit body, no description, no extended explanation
- One logical change per commit; if the diff contains unrelated changes, propose splitting into multiple commits
- Do not commit files that are clearly unrelated to the change (e.g., local editor config, secrets)
- Never use `--no-verify` to skip hooks

## Usage

```bash
/commit
```

The skill will:

- Inspect `git status` and `git diff` (staged and unstaged)
- Stage the relevant files if nothing is staged yet
- Generate the commit message in the format above
- Create the commit and show the result with `git log -1 --oneline`

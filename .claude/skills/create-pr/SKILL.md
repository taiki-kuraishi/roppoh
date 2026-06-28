---
name: create-pr
description: Create a GitHub PR using current diff and pull request template. Title is in English with gitmoji emoji. Body is auto-generated based on diff and template structure. Use when ready to create a PR from current changes.
---

# Create GitHub PR

This skill automates the PR creation process by:

1. **Analyzing the current diff** — examines changes in the working tree
2. **Reading the PR template** — references `.github/pull_request_template.md`
3. **Generating title** — creates a concise title in English with gitmoji emoji
4. **Generating body** — structures the PR body following the template format
5. **Creating the PR** — uses GitHub CLI (`gh`) to create the PR

## Usage

Invoke this skill when you have committed changes and are ready to create a PR:

```bash
/create-pr
```

The skill will:

- Fetch current diff to understand what changed
- Generate an appropriate gitmoji-prefixed title (e.g., `✨ feat: add new feature`, `🐛 fix: resolve issue`, `📝 docs: update documentation`)
- Structure the PR body with:
  - **Summary** — brief overview of changes
  - **Target Package** — which workspace/app is affected
  - **Changes (What)** — bullet-point list of modifications
  - **Related Issues** — links to closes/related issues (if mentioned in commits)
  - **Testing** — testing checkboxes
  - **Breaking Changes** — breaking change checklist
  - **Checklist** — final validation items
- Create the PR on GitHub with the generated content

## Gitmoji Reference

This skill uses emojis from [gitmoji.dev](https://gitmoji.dev/) specification. Please refer to https://gitmoji.dev/ for the complete emoji reference and guidelines.

## Requirements

- `gh` (GitHub CLI) must be installed and authenticated
- Current branch must have changes (diff not empty)
- Must be in a git repository with a GitHub remote
- `.github/pull_request_template.md` must exist

## Notes

- Title is generated in **English only**
- Body follows the project's PR template structure
- All generated content can be reviewed before final commit
- GitHub CLI (`gh pr create`) handles the actual PR creation

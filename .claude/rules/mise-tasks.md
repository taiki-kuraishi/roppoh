# Mise Tasks Guide

This document describes the custom tasks defined in `.mise-tasks/` and when to use them.

## Overview

Mise tasks are shorthand commands that wrap common project operations. They provide a convenient way to execute multi-step workflows with a single command.

### Task Execution

```bash
# Run a mise task
mise run <task-name>

# Alternative syntax (if configured)
<task-name>
```

## Available Tasks

### 1. `install`

**Description**: Setup project environment

**Dependencies**: Runs after `clear-cache`

**Task file**: `.mise-tasks/install`

**What it does**:
See [.mise-tasks/install](./.mise-tasks/install) for full implementation

**When to use**:

- ✅ Initial project setup after cloning
- ✅ When dependencies change (after `git pull`)
- ✅ After deleting `node_modules` or cache
- ✅ Setting up development environment for the first time

**Command**:

```bash
mise run install
```

---

### 2. `dev`

**Description**: Run development server

**Task file**: `.mise-tasks/dev`

**What it does**:
See [.mise-tasks/dev](./.mise-tasks/dev) for full implementation

**When to use**:

- ✅ Starting local development
- ✅ Before making code changes
- ✅ When you need a live-reloading development environment

**Command**:

```bash
mise run dev
```

**Notes**:

- This is an interactive task (runs in foreground)
- Database migrations are applied automatically
- Press `Ctrl+C` to stop the server

---

### 3. `format`

**Description**: Format code (auto-fix)

**Task file**: `.mise-tasks/format`

**What it does**:
See [.mise-tasks/format](./.mise-tasks/format) for full implementation

**When to use**:

- ✅ Before committing code
- ✅ To automatically fix formatting/linting issues
- ✅ When `biome` or `dprint` shows formatting errors
- ✅ Part of your pre-commit workflow

**Command**:

```bash
mise run format
```

**Relation to Pre-commit Hooks**:
This task is similar to what Lefthook runs, but runs on-demand instead of automatically.

---

### 4. `lint`

**Description**: Comprehensive code quality check

**Task file**: `.mise-tasks/lint/` (hierarchical task)

**What it does**:
See [.mise-tasks/lint/](./.mise-tasks/lint/) for full implementation

**When to use**:

- ✅ Before pushing code to remote
- ✅ Running full quality checks
- ✅ CI/CD pipeline validation
- ✅ Final verification before pull request
- ✅ When you want to verify everything is working

**Command**:

```bash
# Run all lint groups (bun / go / k8s / terraform)
mise run lint

# Or run a single group
mise run lint:bun
mise run lint:go
mise run lint:k8s
mise run lint:terraform
```

**Structure**:

`lint` (`lint:_default`) は 4 グループを `depends` で束ねる。グループ間は並列実行(mise デフォルト最大 4 ジョブ)、各グループ内のコマンドは 1 ファイル内で順次実行される。`lint:terraform` はさらに `fmt` / `prod` サブタスクに分かれる(`install:terraform` と同じ構造)。

| Subtask               | What's checked                                                                                           |
| --------------------- | -------------------------------------------------------------------------------------------------------- |
| `lint:bun`            | oxlint (`--fix`) → `turbo type-check` → `turbo build` → knip                                             |
| `lint:go`             | `golangci-lint run` → `go build ./...`                                                                   |
| `lint:k8s`            | `kubeconform` (manifest 検証、patches は除外) → `kube-linter`                                            |
| `lint:terraform:fmt`  | `terraform fmt -check -recursive`(`infra` 全体)                                                          |
| `lint:terraform:prod` | `terraform validate` → `tflint`(`infra/env/prod`。`terraform init` は `mise run install` で実施済み前提) |

**Duration**: This task takes longer as it runs a full build. Use selectively. 特定カテゴリだけ確認したいときは個別サブタスク (`lint:go` など) を使うと速い。

---

### 5. `clear-cache`

**Description**: Clear cache directories

**Task file**: `.mise-tasks/clear-cache`

**What it does**:
See [.mise-tasks/clear-cache](./.mise-tasks/clear-cache) for full implementation

**When to use**:

- ✅ After upgrading dependencies
- ✅ When build/type-check fails unexpectedly
- ✅ When experiencing cache-related issues
- ✅ Troubleshooting "hard reset" scenario
- ✅ Freeing disk space

**Command**:

```bash
mise run clear-cache
```

**Note**: After clearing cache, you must run `mise run install` to restore dependencies.

**Common Workflow**:

```bash
mise run clear-cache
mise run install  # Automatically runs after clear-cache due to dependency
```

---

### 6. `update-vrt-screenshots`

**Description**: Update Visual Regression Test (VRT) screenshots

**Task file**: `.mise-tasks/update-vrt-screenshots`

**What it does**:
See [.mise-tasks/update-vrt-screenshots](./.mise-tasks/update-vrt-screenshots) for full implementation

**When to use**:

- ✅ After intentional UI changes (when visual changes are correct)
- ✅ When visual tests fail due to expected design changes
- ✅ Updating reference screenshots in the repository
- ✅ Ensuring VRT baselines match current UI

**Command**:

```bash
mise run update-vrt-screenshots
```

**Requirements**:

- Docker and Docker Compose must be installed
- Linux container is used for consistent visual rendering

**Workflow**:

1. Make UI changes in code
2. Visual tests fail (because screenshots don't match)
3. Review the differences to ensure they're intentional
4. Run this task to update the reference screenshots
5. Commit the updated screenshots

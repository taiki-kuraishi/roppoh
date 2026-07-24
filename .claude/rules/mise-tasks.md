# Mise Tasks Guide

This document describes the tasks defined in `.mise-tasks/` (and inline in `mise.toml`)
and when to use them.

## Overview

Mise tasks wrap common project operations. They are file-based tasks under `.mise-tasks/`
(hierarchical directories become `parent:child` task names), plus a few inline tasks in
`mise.toml`.

### Task Execution

```bash
# Run a mise task
mise run <task-name>

# Hierarchical (nested) task
mise run <group>:<subtask>
```

Nested directories map to `:`-separated names. For example
`.mise-tasks/lint/bun` → `lint:bun`, and `.mise-tasks/test/vrt/neo-fujimatsu` → `test:vrt:neo-fujimatsu`.
A `_default` file (or inline `[tasks.<group>]`) is the group's default that `depends` on
its children.

## Top-Level Tasks

| Task            | Kind   | Description                                            |
| --------------- | ------ | ------------------------------------------------------ |
| `install`       | group  | Setup project environment (bun / go / terraform)       |
| `clean-install` | group  | `clear-cache` → `install` (hard reset)                 |
| `clear-cache`   | file   | Remove build/cache/`node_modules` directories          |
| `dev`           | group  | Run development servers                                |
| `format`        | inline | Format code with `oxfmt`                               |
| `lint`          | group  | Full quality check (bun / go / k8s / terraform)        |
| `test`          | group  | Run all tests (e2e / unit / vrt)                       |
| `env-decrypt`   | group  | Decrypt sops-encrypted env files                       |
| `env-encrypt`   | group  | Encrypt env files with sops                            |
| `proto:gen`     | file   | Regenerate `discord-events-schemas` codegen from proto |

---

### `install`

**What it does**: `mise install`, `lefthook install`, then (post) `install:bun`,
`install:go`, `env-decrypt`, `install:terraform`.

- `install:bun` — `bun install --frozen-lockfile`, then `playwright install chromium` for neo-fujimatsu
- `install:go` — `go mod download`
- `install:terraform` / `install:terraform:prod` — `terraform init` + `tflint --init` (via sops) in `infra/env/prod`

**When to use**: initial setup after cloning, after `git pull` with dependency changes,
after deleting `node_modules`.

```bash
mise run install
```

---

### `clean-install`

`clear-cache` → `install`. Use for a full hard reset when caches are corrupt.

```bash
mise run clean-install
```

---

### `clear-cache`

Removes `dist`, `.turbo`, `.astro`, `.wrangler`, `node_modules`, `.react-router`,
`.vitest-attachments` directories recursively.

```bash
mise run clear-cache
```

**Note**: after clearing you must run `mise run install` to restore dependencies
(or use `mise run clean-install`).

---

### `dev`

**What it does**: `dev:bun` runs `turbo dev --ui tui` (all JS/TS apps).
`dev:cmd:discord-gateway-proxy` runs the Go gateway proxy via `dotenvx run -- go run .`.

```bash
mise run dev            # or: mise run dev:bun
mise run dev:cmd:discord-gateway-proxy
```

**Notes**: interactive/foreground. Press `Ctrl+C` to stop.

---

### `format`

Inline task in `mise.toml`: `bun run oxfmt`. Formats the whole repo with **oxfmt**.

```bash
mise run format
```

Run before committing (Lefthook runs a similar check automatically).

---

### `proto:gen`

**What it does**: `buf build -o packages/discord-events-schemas/descriptorset.binpb` then
`bun run packages/discord-events-schemas/src/gen.ts`. Regenerates the committed schema codegen
(`pipelines.tf.gen.json` / `iceberg-schema.gen.json` / `records.gen.go`) from the `.proto`
SoT (`proto/roppoh/discord/v1/`). Standalone file task under `.mise-tasks/proto/gen`.

```bash
mise run proto:gen
```

Run after editing `proto/roppoh/discord/v1/*.proto`. `proto-ci.yml` re-runs this and fails on
uncommitted drift (`git diff --exit-code`), like `dashboard-drift-ci` does for Grafana JSON.

---

### `lint`

`lint` (`lint:_default`) bundles 4 groups via `depends`. Groups run in parallel
(mise default, max 4 jobs); commands inside a single group file run sequentially.

```bash
mise run lint          # all groups
mise run lint:bun      # single group
mise run lint:go
mise run lint:k8s
mise run lint:terraform
```

| Subtask               | What's checked                                                                                      |
| --------------------- | --------------------------------------------------------------------------------------------------- |
| `lint:bun`            | `oxlint --fix` → `turbo type-check` → `turbo build` → grafana `dashboard-linter` → `knip`           |
| `lint:go`             | `golangci-lint run` → `go build ./...`                                                              |
| `lint:k8s`            | `kubeconform` (ignores `patches/`, `dashboards/`, `files/`) → `kube-linter`                         |
| `lint:terraform:fmt`  | `terraform fmt -check -recursive` (`infra` 全体)                                                    |
| `lint:terraform:prod` | `terraform validate` → `tflint` (`infra/env/prod`; `terraform init` は `mise run install` 済み前提) |

**Duration**: `lint:bun` runs a full build, so it is the slow one. Use individual
subtasks (`lint:go` など) when you only need one category.

---

### `test`

`test` (`test:_default`) depends on `test:e2e`, `test:unit`, `test:vrt`.

```bash
mise run test          # everything
mise run test:unit     # oxlint-plugins + dev-pod bats + roppoh
mise run test:e2e      # neo-fujimatsu + roppoh + web-console
mise run test:vrt      # visual regression (all apps)
```

**Unit** (`test:unit`):

- `test:unit:oxlint-plugins` — `bun run test` in `packages/oxlint-plugins`
- `test:unit:dev-pod` — `bats test` for dev-pod bin scripts
- `test:unit:roppoh` — `bun run test:unit` in `apps/roppoh`

**E2E** (`test:e2e`): `test:e2e:neo-fujimatsu`, `test:e2e:roppoh`, `test:e2e:web-console` (Playwright).

**VRT** (`test:vrt`): builds a Playwright Docker container (`test:vrt:build-container`,
image `roppoh-playwright:latest`) then runs per-app visual regression:
`test:vrt:neo-fujimatsu`, `test:vrt:roppoh`, `test:vrt:web-console`.

Each per-app VRT task accepts `-u/--update-snapshots`:

```bash
mise run test:vrt:neo-fujimatsu --update-snapshots
```

**Requirements**: Docker (BuildKit) for VRT — a Linux container ensures consistent
visual rendering.

---

### `test:vrt:update-screen-shots`

Updates VRT baseline screenshots for **all** apps by running each per-app VRT task
with `--update-snapshots`.

```bash
mise run test:vrt:update-screen-shots
```

**Workflow**:

1. Make UI changes.
2. VRT fails (screenshots don't match).
3. Review the diffs to confirm they're intentional.
4. Run this task (or a single `mise run test:vrt:<app> --update-snapshots`).
5. Commit the updated screenshots.

---

### `env-decrypt` / `env-encrypt`

sops-based env file management. Targets: `apps/emdash`, `apps/neo-fujimatsu`,
`cmd/discord-gateway-proxy`, `infra/env/prod`.

```bash
mise run env-decrypt
mise run env-encrypt
```

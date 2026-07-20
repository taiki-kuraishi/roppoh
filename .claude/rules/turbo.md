# Turbo Tasks Guide

This document describes the Turbo tasks defined in the root `turbo.json` (and per-workspace
overrides such as `apps/roppoh/turbo.json`) and when to use them.

## Overview

Turbo orchestrates tasks across workspaces with:

- **Parallel Execution** across workspaces
- **Smart Caching** (skip when inputs unchanged)
- **Dependency Management** (`^task` runs the task in dependency workspaces first)

Turbo is pinned via mise (`npm:turbo`), so invoke it directly as `turbo <task>`
(the mise tasks call it this way). `bun turbo <task>` also works.

### Task Execution

```bash
# Run a turbo task
turbo <task-name>

# Force execution (skip cache)
turbo --force <task-name>

# Run in a specific workspace
turbo <task-name> --filter=@roppoh/roppoh

# Watch mode
turbo <task-name> --watch
```

## Root `turbo.json`

```jsonc
{
  "tasks": {
    "build": { "cache": true, "dependsOn": ["^build"] },
    "cf-typegen": {
      "cache": true,
      "dependsOn": ["^cf-typegen"],
      "outputs": ["worker-configuration.d.ts"],
    },
    "type-check": { "cache": true, "dependsOn": ["^type-check"], "outputs": [] },
    "dev": { "cache": false, "persistent": true },
    "test": { "cache": false },
  },
}
```

Workspaces may extend this (e.g. `apps/roppoh/turbo.json` uses `"extends": ["//"]` and
adds `inputs`/`outputs` for `build`, `cf-typegen`, `type-check`).

## Available Tasks

### 1. `build`

**Cache**: Enabled ✅ · **Dependencies**: `^build`

Builds all workspaces that define a `build` script. Dependency workspaces build first.

```bash
turbo build
```

**Which workspaces build**: only workspaces with a `build` script participate. Currently:

- `packages/grafana-dashboards` — `bun run ./src/generate.ts`
- `apps/roppoh`, `apps/ura-roppoh`, `apps/neo-fujimatsu`, `apps/web-console` — `vite build`
- `apps/emdash` — Astro build

> Type-only packages (`@roppoh/better-auth`, `@roppoh/better-auth-query`, `@roppoh/domain`,
> `@roppoh/shadcn`) have no `build` script; they are consumed as source via workspace
> `paths`/exports and only run `type-check`.

**Notes**:

- First run builds everything; unchanged workspaces are skipped (cached).
- Use `turbo --force build` to rebuild everything.
- Output goes to each workspace's `dist/`.

---

### 2. `type-check`

**Cache**: Enabled ✅ · **Dependencies**: `^type-check`

Runs `tsc --noEmit` in each workspace. Emits no JS output.

```bash
turbo type-check
```

**Notes**: fast relative to `build`; cached per workspace. `turbo --force type-check`
to re-check everything.

---

### 3. `cf-typegen`

**Cache**: Enabled ✅ · **Dependencies**: `^cf-typegen` · **Output**: `worker-configuration.d.ts`

Generates Cloudflare Worker type definitions (`wrangler types --strict-vars=false`) for
the Cloudflare-backed apps.

```bash
turbo cf-typegen
```

**Notes**: output file is tracked by the Turbo cache; safe to run frequently.

---

### 4. `dev`

**Cache**: Disabled ❌ · **Persistent**: yes

Runs each workspace's dev server. Invoked by `mise run dev` as `turbo dev --ui tui`.

```bash
turbo dev --ui tui
```

Persistent task — stays running until you stop it (`Ctrl+C`).

---

### 5. `test`

**Cache**: Disabled ❌ · **Dependencies**: none

Runs tests in each workspace. Cache is intentionally disabled so tests always execute.

```bash
turbo test
turbo test --filter=@roppoh/roppoh
```

> For the full test matrix (unit / e2e / VRT, including the Dockerized visual regression
> flow) prefer the mise tasks — see `.claude/rules/mise-tasks.md`.

---

## Caching Strategy

### Cached ✅

- `build` — skip if inputs unchanged
- `type-check` — skip if inputs unchanged
- `cf-typegen` — skip if `wrangler.jsonc` / `.env.local` unchanged

### Non-Cached ❌

- `dev` — persistent
- `test` — always runs

### Force Execution

```bash
turbo --force build
turbo --force type-check
turbo --force cf-typegen
```

### When Cache Gets Stale

Cache is invalidated when:

- Source (declared `inputs`) changes
- Dependencies change (`bun.lock`)
- Configuration files change

To manually invalidate:

```bash
rm -rf .turbo        # or per-workspace dist/.turbo
mise run clear-cache # removes dist / .turbo / node_modules / etc.
```

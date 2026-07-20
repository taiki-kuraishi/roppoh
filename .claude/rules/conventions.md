# Available Tools & Environment

This document describes the tools and environment available in this project.

## Tool Versions

This project manages **all** tools via `mise.toml` (see the file for the source of truth).
The monorepo spans JS/TS (Bun), Go, Kubernetes, and Terraform, so mise pins more than
just the JS toolchain:

| Tool              | Version | Purpose                                              |
| ----------------- | ------- | ---------------------------------------------------- |
| **Bun**           | 1.3.14  | JavaScript Runtime & Package Manager                 |
| **Node**          | 24      | Runtime for npm-installed CLIs (e.g. Turbo shebangs) |
| **Turbo**         | 2.10.5  | Monorepo task execution (`npm:turbo` backend)        |
| **Go**            | 1.26.5  | `cmd/*` services (keep in sync with `go.mod`)        |
| **golangci-lint** | 2.12.2  | Go linting                                           |
| **kube-linter**   | 0.8.3   | Kubernetes manifest linting                          |
| **kubeconform**   | 0.8.0   | Kubernetes manifest schema validation                |
| **lefthook**      | 2.1.10  | Git hooks (pre-commit / pre-push)                    |
| **terraform**     | 1.15.8  | Infrastructure as Code                               |
| **tflint**        | 0.64.0  | Terraform linting                                    |
| **sops**          | 3.13.2  | Secret encryption/decryption                         |
| **age**           | 1.3.1   | Encryption backend for sops                          |
| **bats**          | 1.13.0  | Shell script test runner (`npm:bats` backend)        |

> ⚠️ Versions drift over time. Treat `mise.toml` as authoritative; the table above is a summary.

## Package Manager: Bun Only

**⚠️ IMPORTANT**: Always use **Bun** as the package manager. mise is configured with
`npm.bun = true`, so even `npm:` backend tools install through Bun.

❌ **DO NOT use**:

- `npm`
- `yarn`
- `pnpm`

✅ **Use**:

- `bun` (default package manager)
- `bunx` (for running tools without installing)

## Code Formatting & Linting

- **Formatter**: `oxfmt` (config: `oxfmt.config.ts`). Run via `mise run format`.
- **Linter**: `oxlint` with the custom `@roppoh/oxlint-plugins` plugin (config: `oxlint.config.ts`).
- Full quality gate: `mise run lint` (see `.claude/rules/mise-tasks.md`).

> Note: this project does **not** use Biome, Prettier, or dprint.

## After Editing Code

Always run:

```bash
mise run format
mise run lint
```

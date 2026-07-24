---
paths:
  - ".claude/rules/**"
---

# .claude/rules/ の置き場ルール

rule ファイルの配置は、**その rule が対象とする repo のディレクトリ構造にミラーする**。
フラットに並べず、`paths:` スコープが指す場所と rule ファイルの位置を一致させる。

## 配置の基準

| rule の種類                                 | 置き場                          | 例                                                                        |
| ------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------- |
| 特定 app スコープ (`apps/<app>/**`)         | `.claude/rules/apps/<app>/`     | `.claude/rules/apps/roppoh/directory-structure.md`                        |
| 特定 package スコープ (`packages/<pkg>/**`) | `.claude/rules/packages/<pkg>/` | `.claude/rules/packages/better-auth/better-auth.md`                       |
| workspace 全体スコープ                      | `.claude/rules/` 直下           | `apps.md` (`apps/**`) / `packages.md` (`packages/**`)                     |
| repo にミラー先が無い横断ルール             | `.claude/rules/` 直下(フラット) | `docker.md` / `github-actions.md` / `go.md` / `k8s.md` / `terraform.md`   |
| 常時 import(`paths:` なし)                  | `.claude/rules/` 直下           | `conventions.md` / `mise-tasks.md` / `turbo.md` / `workspace-packages.md` |

- ミラーは **特定 workspace(`apps/*`・`packages/*`)に 1:1 対応する rule のみ**に適用する。
  workspace 全体スコープや横断ルールは無理にディレクトリを切らず直下に置く(空箱ディレクトリを避ける)。
- rule のマッチングは各ファイル先頭の `paths:` frontmatter が決める。**ファイルを移動しても
  マッチ挙動は変わらない** — 位置は管理しやすさのための規約。

## rule を追加・移動・リネームしたとき

1. 上記の基準に沿った場所へ置く(`git mv` で移動)。
2. ルート `CLAUDE.md` の paths スコープ一覧のパスを追従修正する。
3. 他の rule / doc からの参照(例: `apps.md`・`packages.md` の表、`react-components.md` の
   Related Documentation)に旧パスが残っていないか grep で確認する。

#!/usr/bin/env bats
# dev-pod-init: dotfiles(yadm)同期スクリプトのテスト。yadmをスタブする。
#
# 注意: スクリプトは絶対パス /nix/var/nix/profiles/default を直接見るため、実際に
# Nixが導入済みの開発マシンでは「nixが無い」シナリオを再現できない。CI(素のUbuntu
# ランナー)ではこの制約はなく、該当テストは通常どおり実行される。

load 'helpers/stub'

SCRIPT="$BATS_TEST_DIRNAME/../dev-pod-init"

setup() {
  stub_setup
  TEST_HOME="$(mktemp -d)"
  export HOME="$TEST_HOME"
}

teardown() {
  stub_teardown
  rm -rf "$TEST_HOME"
}

@test "yadmリポジトリが無ければ clone --bootstrap を呼び、.gitconfig.localを生成する" {
  stub_cmd yadm 0 ""

  run bash "$SCRIPT"
  [ "$status" -eq 0 ]
  [[ "$(stub_calls yadm)" == *"clone --bootstrap https://github.com/taiki-kuraishi/dotfiles.git"* ]]

  [ -f "$HOME/.gitconfig.local" ]
  grep -q 'git-credential-github-app' "$HOME/.gitconfig.local"
  grep -q 'useHttpPath = true' "$HOME/.gitconfig.local"
}

@test "既存リポジトリ+nixありなら pull --rebase のみでbootstrapは呼ばない" {
  mkdir -p "$HOME/.local/share/yadm/repo.git"
  mkdir -p "$HOME/.nix-profile"
  stub_cmd yadm 0 ""

  run bash "$SCRIPT"
  [ "$status" -eq 0 ]
  local calls
  calls="$(stub_calls yadm)"
  [[ "$calls" == *"pull --rebase"* ]]
  [[ "$calls" != *"bootstrap"* ]]
}

@test "既存リポジトリ+nix無しなら pull --rebase と bootstrap の両方を呼ぶ" {
  if [ -e /nix/var/nix/profiles/default ]; then
    skip "このマシンには実際の /nix が存在するため 'nix無し' を再現できない"
  fi
  mkdir -p "$HOME/.local/share/yadm/repo.git"
  stub_cmd yadm 0 ""

  run bash "$SCRIPT"
  [ "$status" -eq 0 ]
  local calls
  calls="$(stub_calls yadm)"
  [[ "$calls" == *"pull --rebase"* ]]
  [[ "$calls" == *"bootstrap"* ]]
}

@test "yadm pull --rebase が失敗しても異常終了しない" {
  mkdir -p "$HOME/.local/share/yadm/repo.git"
  mkdir -p "$HOME/.nix-profile"
  stub_cmd yadm 1 ""

  run bash "$SCRIPT"
  [ "$status" -eq 0 ]
}

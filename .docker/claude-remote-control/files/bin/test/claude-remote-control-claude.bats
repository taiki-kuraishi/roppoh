#!/usr/bin/env bats
# claude-remote-control-claude: claude コンテナのentrypointのテスト。claude をスタブする。

load 'helpers/stub'

SCRIPT="$BATS_TEST_DIRNAME/../claude-remote-control-claude"

setup() {
  stub_setup
  TEST_HOME="$(mktemp -d)"
  export HOME="$TEST_HOME"
}

teardown() {
  stub_teardown
  rm -rf "$TEST_HOME"
}

@test "claudeコマンドと認証情報が揃っていれば即座にexecする" {
  stub_cmd claude 0 ""
  mkdir -p "$HOME/.claude"
  echo '{}' > "$HOME/.claude/.credentials.json"

  run bash "$SCRIPT"
  [ "$status" -eq 0 ]
  [ "$(stub_calls claude)" = "remote-control --spawn=worktree --name roppoh-dev" ]
}

@test "前提が揃っていないと待機を続け、execまで到達しない" {
  # `timeout(1)` はmacOS標準では使えないため、bash組み込みで代替する。
  CLAUDE_WAIT_INTERVAL=5 bash "$SCRIPT" &
  local pid=$!
  sleep 0.5

  local still_waiting=0
  if kill -0 "$pid" 2>/dev/null; then
    still_waiting=1
    kill "$pid" 2>/dev/null
  fi
  wait "$pid" 2>/dev/null || true

  [ "$still_waiting" -eq 1 ]
  [ "$(stub_call_count claude)" -eq 0 ]
}

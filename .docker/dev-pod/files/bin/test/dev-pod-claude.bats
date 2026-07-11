#!/usr/bin/env bats
# dev-pod-claude: claude コンテナのentrypointのテスト。sleep をスタブする。

load 'helpers/stub'

SCRIPT="$BATS_TEST_DIRNAME/../dev-pod-claude"

setup() {
  stub_setup
}

teardown() {
  stub_teardown
}

@test "sleep infinityをexecするだけで、他のコマンドは呼ばない" {
  stub_cmd sleep 0 ""

  run bash "$SCRIPT"
  [ "$status" -eq 0 ]
  [ "$(stub_calls sleep)" = "infinity" ]
}

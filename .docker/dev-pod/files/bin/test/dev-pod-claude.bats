#!/usr/bin/env bats
# dev-pod-claude: claude コンテナのentrypointのテスト。AppRun をスタブする。

load 'helpers/stub'

SCRIPT="$BATS_TEST_DIRNAME/../dev-pod-claude"

setup() {
  stub_setup
  TEST_APPDIR="$(mktemp -d)"
  cat > "$TEST_APPDIR/AppRun" <<'STUB'
#!/usr/bin/env bash
printf '%s\n' "$*" >> "${STUB_CALLS_DIR}/AppRun.calls"
STUB
  chmod +x "$TEST_APPDIR/AppRun"
  export ORCA_APPDIR="$TEST_APPDIR"
}

teardown() {
  stub_teardown
  rm -rf "$TEST_APPDIR"
}

@test "ORCA_PAIRING_ADDRESSを渡してAppRun serveをexecする(--mobile-pairingは付けない)" {
  export ORCA_PAIRING_ADDRESS=dev-pod-orca.example.com

  run bash "$SCRIPT"
  [ "$status" -eq 0 ]
  [ "$(cat "$STUB_CALLS_DIR/AppRun.calls")" = "serve --port 6768 --pairing-address dev-pod-orca.example.com" ]
}

@test "ORCA_PAIRING_ADDRESSが未設定ならエラー終了する" {
  unset ORCA_PAIRING_ADDRESS || true

  run bash "$SCRIPT"
  [ "$status" -ne 0 ]
  [ ! -f "$STUB_CALLS_DIR/AppRun.calls" ]
}

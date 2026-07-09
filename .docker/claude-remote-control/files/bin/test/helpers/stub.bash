# bats テストヘルパー: PATH 上にスタブコマンドを差し込み、呼び出し引数/stdin を記録する。
#
# 使い方:
#   load 'helpers/stub'
#   setup()    { stub_setup; }
#   teardown() { stub_teardown; }
#
#   stub_cmd curl 0 '{"token":"tok_abc"}'   # curl を exit0・stdout固定文字列で差し替え
#   run some-script-that-calls-curl
#   stub_calls curl                          # 記録された呼び出し引数(1行1回、空白区切り)を取得

stub_setup() {
  STUB_BIN_DIR="$(mktemp -d)"
  STUB_CALLS_DIR="$(mktemp -d)"
  export STUB_BIN_DIR STUB_CALLS_DIR
  export PATH="$STUB_BIN_DIR:$PATH"
}

stub_teardown() {
  rm -rf "$STUB_BIN_DIR" "$STUB_CALLS_DIR"
}

# stub_cmd <name> [exit_code] [stdout]
stub_cmd() {
  local name="$1" exit_code="${2:-0}" stdout="${3:-}"
  local calls_file="$STUB_CALLS_DIR/${name}.calls"
  local stdin_file="$STUB_CALLS_DIR/${name}.stdin"
  local stdout_file="$STUB_BIN_DIR/.${name}.stdout"
  : > "$calls_file"
  : > "$stdin_file"
  printf '%s' "$stdout" > "$stdout_file"
  cat > "$STUB_BIN_DIR/$name" <<STUB
#!/usr/bin/env bash
printf '%s\n' "\$*" >> "$calls_file"
if [ ! -t 0 ]; then
  cat >> "$stdin_file"
fi
cat "$stdout_file"
exit $exit_code
STUB
  chmod +x "$STUB_BIN_DIR/$name"
}

# stub_calls <name>: 記録された呼び出し引数(1行1回)を出力
stub_calls() {
  cat "$STUB_CALLS_DIR/${1}.calls" 2>/dev/null
}

# stub_call_count <name>: 呼び出し回数
stub_call_count() {
  stub_calls "$1" | grep -c . || true
}

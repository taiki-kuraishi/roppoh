#!/usr/bin/env bats
# gh-app-token: GitHub App の installation access token 発行スクリプトのテスト。
# openssl/jq は実物を使い(暗号処理はローカル完結でネットワーク不要)、curl だけをスタブする。

load 'helpers/stub'

SCRIPT="$BATS_TEST_DIRNAME/../gh-app-token"

# base64url(パディング無し)文字列を実データにデコードする
b64url_decode() {
  local input="$1"
  local mod4=$(( ${#input} % 4 ))
  if [ "$mod4" -eq 2 ]; then
    input="${input}=="
  elif [ "$mod4" -eq 3 ]; then
    input="${input}="
  fi
  printf '%s' "$input" | tr -- '-_' '+/' | openssl base64 -A -d
}

setup() {
  stub_setup
  APP_DIR="$(mktemp -d)"
  export GH_APP_TOKEN_DIR="$APP_DIR"
  openssl genrsa -out "$APP_DIR/private-key.pem" 2048 >/dev/null 2>&1
  printf '123456' > "$APP_DIR/app-id"
  printf '999' > "$APP_DIR/installation-id-tsar-org"
}

teardown() {
  stub_teardown
  rm -rf "$APP_DIR"
}

@test "未知のownerはexit1でエラーを出し、curlは呼ばれない" {
  run bash "$SCRIPT" unknown-owner
  [ "$status" -eq 1 ]
  [[ "$output" == *"unknown owner"* ]]
  [ "$(stub_call_count curl)" -eq 0 ]
}

@test "既知のownerで正しいJWTを組み立ててcurlを呼び、tokenを出力する" {
  stub_cmd curl 0 '{"token":"tok_abc"}'

  run bash "$SCRIPT" tsar-org
  [ "$status" -eq 0 ]
  [ "$output" = "tok_abc" ]

  local call jwt header payload
  call="$(stub_calls curl)"
  [[ "$call" == *"https://api.github.com/app/installations/999/access_tokens"* ]]
  [[ "$call" == *"Authorization: Bearer "* ]]

  jwt="$(printf '%s' "$call" | grep -oE 'Bearer [^ ]+' | cut -d' ' -f2)"
  header="$(printf '%s' "$jwt" | cut -d. -f1)"
  payload="$(printf '%s' "$jwt" | cut -d. -f2)"

  [[ "$(b64url_decode "$header")" == *'"alg":"RS256"'* ]]
  [[ "$(b64url_decode "$payload")" == *'"iss":"123456"'* ]]
}

@test "既定のowner(引数省略)はtsar-orgになる" {
  stub_cmd curl 0 '{"token":"tok_default"}'
  run bash "$SCRIPT"
  [ "$status" -eq 0 ]
  [ "$output" = "tok_default" ]
}

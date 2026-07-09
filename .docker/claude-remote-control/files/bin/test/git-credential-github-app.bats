#!/usr/bin/env bats
# git-credential-github-app: git credential helper のテスト。gh-app-token をスタブする。

load 'helpers/stub'

SCRIPT="$BATS_TEST_DIRNAME/../git-credential-github-app"

setup() { stub_setup; }
teardown() { stub_teardown; }

@test "action が get 以外なら何もせずexit0" {
  run bash -c "printf 'path=owner/repo\n' | bash '$SCRIPT' store"
  [ "$status" -eq 0 ]
  [ -z "$output" ]
}

@test "有効なpathならgh-app-tokenをownerで呼びusername/passwordを出力する" {
  stub_cmd gh-app-token 0 "tok_xyz"

  run bash -c "printf 'path=owner/repo\n' | bash '$SCRIPT' get"
  [ "$status" -eq 0 ]
  [[ "$output" == *"username=x-access-token"* ]]
  [[ "$output" == *"password=tok_xyz"* ]]
  [ "$(stub_calls gh-app-token)" = "owner" ]
}

@test "gh-app-tokenが失敗したら何も出力せずexit0(フォールバック)" {
  stub_cmd gh-app-token 1 ""

  run bash -c "printf 'path=unknown-owner/repo\n' | bash '$SCRIPT' get"
  [ "$status" -eq 0 ]
  [ -z "$output" ]
}

@test "pathが渡らない場合は何も出力せずexit0" {
  run bash -c "printf '\n' | bash '$SCRIPT' get"
  [ "$status" -eq 0 ]
  [ -z "$output" ]
  [ "$(stub_call_count gh-app-token)" -eq 0 ]
}

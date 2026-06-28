# discord-gateway-proxy

Discord Gateway(WebSocket)に接続し、受信した全イベントを構造化 JSON ログとして出力する常駐サービス。

このモノレポ初の Discord Gateway consumer。既存アプリは Cloudflare Workers(サーバーレス)で永続 WebSocket を保持できないため、別プロセスとして Go で実装している。

## 構成

リポジトリ root の単一 Go モジュール(`github.com/tsar-org/roppoh`)に属する。

```
cmd/discord-gateway-proxy/main.go   # エントリポイント(wire-up + シグナル処理)
internal/config                     # 環境変数の読み込み
internal/logging                    # slog JSON ロガー
internal/gateway                    # discordgo セッション生成 + イベントハンドラ
```

## 環境変数

| 変数                | 必須 | 既定   | 説明                                |
| ------------------- | ---- | ------ | ----------------------------------- |
| `DISCORD_BOT_TOKEN` | ✅   | —      | Discord Bot トークン                |
| `LOG_LEVEL`         | —    | `info` | `debug` / `info` / `warn` / `error` |

`.env.example` を参照。

## ローカル実行

```bash
# bot トークンを渡して起動
DISCORD_BOT_TOKEN=<bot-token> LOG_LEVEL=debug mise exec -- go run ./cmd/discord-gateway-proxy
```

起動すると `ready`(接続ユーザー・guild 数)ログが出力され、対象 Guild で発生したイベントが `gateway event`(`event_type`)として流れる。`Ctrl-C`(SIGINT/SIGTERM)で graceful shutdown する。

## Intents

非特権 intents(`IntentsAllWithoutPrivileged`)のみを要求する。メッセージ本文(`MESSAGE_CONTENT`)・メンバー一覧(`GUILD_MEMBERS`)・presence は含まれない。これらが必要になった場合は Discord Developer Portal で特権 Intent を有効化したうえで `internal/gateway/gateway.go` の intents 設定を変更する。

## Docker

ビルドコンテキストはリポジトリ root(単一 `go.mod` を参照するため)。

```bash
docker build -f .docker/discord-gateway-proxy/Dockerfile -t discord-gateway-proxy .
docker run --rm -e DISCORD_BOT_TOKEN=<bot-token> discord-gateway-proxy
```

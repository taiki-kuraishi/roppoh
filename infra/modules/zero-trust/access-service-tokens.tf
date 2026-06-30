# ----- Cloudflare Access Service Token: Ollama -----
# Service Token 認証で API クライアントからのアクセスを制御する
# クライアントは CF-Access-Client-Id / CF-Access-Client-Secret ヘッダを付与してリクエストする
resource "cloudflare_zero_trust_access_service_token" "ollama" {
  account_id = var.account_id
  name       = "ollama"
}

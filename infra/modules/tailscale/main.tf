# ----- ACL Policy -----
# tailnet のポリシーファイル全体を Terraform で管理する。
# overwrite_existing_content = true は「既存ポリシーを ETag チェックなしで上書き」する
# 破壊的操作。新規 tailnet(デフォルト allow-all)前提。管理画面でポリシーを手編集済みの
# 場合は先に `terraform import tailscale_acl.this acl` してから運用すること。
resource "tailscale_acl" "this" {
  overwrite_existing_content = true
  acl = jsonencode({
    # tag:minecraft を定義。auth_keys スコープの OAuth client がこのタグを付与した
    # auth key を発行できるよう tagOwners に明示する(OAuth 発行キーはユーザー紐付けが
    # 無いためタグ必須)。
    tagOwners = {
      (var.tag) = ["autogroup:admin"]
    }
    # ホームラボ想定の allow-all(新規 tailnet のデフォルト同等)。必要に応じて絞る。
    acls = [
      {
        action = "accept"
        src    = ["*"]
        dst    = ["*:*"]
      }
    ]
  })
}

# ----- MagicDNS -----
# <hostname>.<tailnet>.ts.net での名前解決を有効化(友人は minecraft.<tailnet>.ts.net で接続)。
resource "tailscale_dns_preferences" "this" {
  magic_dns = true
}

# ----- Tailnet Settings -----
# HTTPS 証明書を有効化。TS_SERVE_CONFIG が確実に適用される前提条件
# (古いクライアントは HTTPS 無効時に serve 設定を黙って無視する)。
resource "tailscale_tailnet_settings" "this" {
  https_enabled = true
}

# ----- Auth Key (k8s minecraft node) -----
# k8s の tailscale ノード登録用キー。
# reusable(Pod 再作成での再登録可)/ ephemeral(オフライン時に自動削除)/
# preauthorized(手動承認不要)/ tag:minecraft。
resource "tailscale_tailnet_key" "minecraft" {
  reusable      = true
  ephemeral     = true
  preauthorized = true
  expiry        = var.auth_key_expiry_seconds
  description   = "k8s minecraft tailscale node"
  tags          = [var.tag]

  # tagOwners が ACL に存在してからでないとタグ付きキーを発行できない。
  depends_on = [tailscale_acl.this]
}

resource "cloudflare_secrets_store" "this" {
  account_id = var.account_id
  name       = "default_secrets_store"
}

resource "cloudflare_secrets_store_secret" "neo_fujimatsu_better_auth_secret" {
  account_id = var.account_id
  store_id   = cloudflare_secrets_store.this.id
  name       = "neo-fujimatsu-better-auth-secret"
  value      = "placeholder"
  scopes     = ["workers"]

  lifecycle {
    ignore_changes = [value]
  }
}

resource "cloudflare_secrets_store_secret" "roppoh_discord_client_secret" {
  account_id = var.account_id
  store_id   = cloudflare_secrets_store.this.id
  name       = "roppoh-discord-client-secret"
  value      = "placeholder"
  scopes     = ["workers"]

  lifecycle {
    ignore_changes = [value]
  }
}

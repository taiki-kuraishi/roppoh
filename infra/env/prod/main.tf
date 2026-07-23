# ----- D1 -----
module "d1" {
  source     = "../../modules/d1"
  account_id = var.cloudflare_account_id
}

# ----- R2 -----
module "r2" {
  source     = "../../modules/r2"
  account_id = var.cloudflare_account_id
}

# ----- KV -----
module "kv" {
  source     = "../../modules/kv"
  account_id = var.cloudflare_account_id
}

# ----- API Token (GitHub Actions Workers deploy) -----
module "api_token" {
  source     = "../../modules/api-token"
  account_id = var.cloudflare_account_id
}

# ----- Secrets Store -----
module "secrets_store" {
  source     = "../../modules/secrets-store"
  account_id = var.cloudflare_account_id
}

# ----- Zero Trust (Cloudflare Tunnel) -----
module "zero_trust" {
  source     = "../../modules/zero-trust"
  account_id = var.cloudflare_account_id
}

# ----- DNS -----
module "dns" {
  source       = "../../modules/dns"
  zone_name    = "tsar-bmb.org"
  tunnel_cname = module.zero_trust.tunnel_cname
}

# ----- Pipelines (Discord activity/presence events -> R2 Data Catalog) -----
module "pipelines" {
  source     = "../../modules/pipelines"
  account_id = var.cloudflare_account_id
}

# ----- Tailscale (mesh VPN: expose k8s Minecraft over tailnet) -----
module "tailscale" {
  source = "../../modules/tailscale"
}

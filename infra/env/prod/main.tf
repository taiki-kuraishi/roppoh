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

# ----- Secrets Store -----
module "secrets_store" {
  source     = "../../modules/secrets-store"
  account_id = var.cloudflare_account_id
}

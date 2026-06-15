resource "cloudflare_workers_kv_namespace" "roppoh_emdash" {
  account_id = var.account_id
  title      = "roppoh-emdash-kv"
}

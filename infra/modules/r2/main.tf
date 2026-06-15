resource "cloudflare_r2_bucket" "roppoh_emdash_media" {
  account_id = var.account_id
  name       = "roppoh-emdash-media"
}

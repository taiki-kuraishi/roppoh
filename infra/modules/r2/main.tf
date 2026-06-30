resource "cloudflare_r2_bucket" "roppoh_emdash_media" {
  account_id = var.account_id
  name       = "roppoh-emdash-media"
}

# ----- Grafana LGTM stack -----
resource "cloudflare_r2_bucket" "roppoh_grafana_loki" {
  account_id = var.account_id
  name       = "roppoh-grafana-loki"
}

resource "cloudflare_r2_bucket" "roppoh_grafana_mimir_blocks" {
  account_id = var.account_id
  name       = "roppoh-grafana-mimir-blocks"
}

resource "cloudflare_r2_bucket" "roppoh_grafana_mimir_ruler" {
  account_id = var.account_id
  name       = "roppoh-grafana-mimir-ruler"
}

resource "cloudflare_r2_bucket" "roppoh_grafana_mimir_alertmanager" {
  account_id = var.account_id
  name       = "roppoh-grafana-mimir-alertmanager"
}

resource "cloudflare_r2_bucket" "roppoh_grafana_tempo" {
  account_id = var.account_id
  name       = "roppoh-grafana-tempo"
}

# ----- zot OCI registry (in-cluster image store) -----
resource "cloudflare_r2_bucket" "roppoh_zot" {
  account_id = var.account_id
  name       = "roppoh-zot"
}

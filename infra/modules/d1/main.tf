resource "cloudflare_d1_database" "roppoh_better_auth" {
  account_id = var.account_id
  name       = "roppoh-better-auth"

  read_replication = {
    mode = "disabled"
  }
}

resource "cloudflare_d1_database" "roppoh_emdash_database" {
  account_id = var.account_id
  name       = "roppoh-emdash-database"

  read_replication = {
    mode = "disabled"
  }
}

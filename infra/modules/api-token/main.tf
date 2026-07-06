# ----- Cloudflare API Token: GitHub Actions Workers deploy -----
# wrangler deploy に必要な最小権限のみ付与する専用トークン
# (infra/env/prod の terraform apply 用トークンとは別物)

data "cloudflare_zone" "this" {
  filter = {
    name = var.zone_name
  }
}

data "cloudflare_account_api_token_permission_groups_list" "workers_scripts_write" {
  account_id = var.account_id
  name       = "Workers Scripts Write"
}

data "cloudflare_account_api_token_permission_groups_list" "workers_routes_write" {
  account_id = var.account_id
  name       = "Workers Routes Write"
}

resource "cloudflare_account_token" "github_actions_workers_deploy" {
  name       = "github-actions-workers-deploy"
  account_id = var.account_id

  policies = [
    {
      effect = "allow"
      permission_groups = [
        { id = data.cloudflare_account_api_token_permission_groups_list.workers_scripts_write.result[0].id },
      ]
      resources = jsonencode({ "com.cloudflare.api.account.${var.account_id}" = "*" })
    },
    {
      effect = "allow"
      permission_groups = [
        { id = data.cloudflare_account_api_token_permission_groups_list.workers_routes_write.result[0].id },
      ]
      resources = jsonencode({ "com.cloudflare.api.account.zone.${data.cloudflare_zone.this.zone_id}" = "*" })
    },
  ]
}

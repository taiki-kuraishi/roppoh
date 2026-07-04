# ----- Discord activity/presence events: R2 bucket + Data Catalog -----
resource "cloudflare_r2_bucket" "roppoh_discord_events" {
  account_id = var.account_id
  name       = "roppoh-discord-events"
}

resource "cloudflare_r2_data_catalog" "roppoh_discord_events" {
  account_id  = var.account_id
  bucket_name = cloudflare_r2_bucket.roppoh_discord_events.name
}

# ----- Sink token: R2 object write + Data Catalog write -----
# Used by the pipeline sink itself (Cloudflare-managed, not exposed to the app).
data "cloudflare_account_api_token_permission_groups_list" "r2_bucket_item_write" {
  account_id = var.account_id
  name       = "Workers R2 Storage Bucket Item Write"
}

data "cloudflare_account_api_token_permission_groups_list" "r2_data_catalog_write" {
  account_id = var.account_id
  name       = "Workers R2 Data Catalog Write"
}

resource "cloudflare_account_token" "discord_events_sink" {
  name       = "roppoh-discord-events-sink"
  account_id = var.account_id

  policies = [{
    effect = "allow"
    permission_groups = [
      { id = data.cloudflare_account_api_token_permission_groups_list.r2_bucket_item_write.result[0].id },
      { id = data.cloudflare_account_api_token_permission_groups_list.r2_data_catalog_write.result[0].id },
    ]
    resources = jsonencode({ "com.cloudflare.api.account.${var.account_id}" = "*" })
  }]
}

# ----- Ingest token: HTTP ingest auth for discord-gateway-proxy -----
data "cloudflare_account_api_token_permission_groups_list" "pipelines_send" {
  account_id = var.account_id
  name       = "Pipelines Send"
}

resource "cloudflare_account_token" "discord_events_ingest" {
  name       = "roppoh-discord-events-ingest"
  account_id = var.account_id

  policies = [{
    effect = "allow"
    permission_groups = [
      { id = data.cloudflare_account_api_token_permission_groups_list.pipelines_send.result[0].id },
    ]
    resources = jsonencode({ "com.cloudflare.api.account.${var.account_id}" = "*" })
  }]
}

# ----- Stream: HTTP ingest for discord-gateway-proxy activity/presence events -----
# Streams and sinks share a single Pipelines-wide name space, so their names
# must differ even though they belong to the same logical pipeline.
resource "cloudflare_pipeline_stream" "discord_events" {
  account_id = var.account_id
  name       = "discord_events_stream"
  format     = { type = "json" }

  schema = {
    fields = [
      { name = "event_type", type = "string", required = true },
      { name = "received_at", type = "timestamp", required = true },
      { name = "guild_id", type = "string", required = false },
      { name = "user_id", type = "string", required = false },
      { name = "payload", type = "json", required = true },
    ]
  }

  http = {
    enabled        = true
    authentication = true
    cors           = {}
  }
  worker_binding = { enabled = false }
}

# ----- Sink: write to R2 Data Catalog as Iceberg (Parquet) -----
resource "cloudflare_pipeline_sink" "discord_events" {
  account_id = var.account_id
  name       = "discord_events_sink"
  type       = "r2_data_catalog"
  format     = { type = "parquet" }
  schema     = { fields = [] }

  config = {
    account_id = var.account_id
    bucket     = cloudflare_r2_bucket.roppoh_discord_events.name
    namespace  = "discord"
    table_name = "events"
    token      = cloudflare_account_token.discord_events_sink.value
  }
}

# ----- Pipeline: connect stream to sink -----
resource "cloudflare_pipeline" "discord_events" {
  account_id = var.account_id
  name       = "discord_events"
  sql        = "INSERT INTO ${cloudflare_pipeline_sink.discord_events.name} SELECT * FROM ${cloudflare_pipeline_stream.discord_events.name}"
}

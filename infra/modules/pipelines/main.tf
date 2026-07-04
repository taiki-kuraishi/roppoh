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
# Used by the pipeline sinks themselves (Cloudflare-managed, not exposed to
# the app). Shared across all three tables below.
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
# Account-scoped, so shared across all three streams below.
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

# =====================================================================
# presence_update: live discordgo.PresenceUpdate events. One row per
# activity (see internal/handler.presenceRecords); a presence with no
# activity is one row with the activity_* columns NULL.
# =====================================================================

resource "cloudflare_pipeline_stream" "presence_update" {
  account_id = var.account_id
  name       = "presence_update_stream"
  format     = { type = "json" }

  schema = {
    fields = [
      { name = "received_at", type = "timestamp", required = true },
      { name = "guild_id", type = "string", required = true },
      { name = "user_id", type = "string", required = true },
      { name = "status", type = "string", required = false },
      { name = "client_desktop", type = "string", required = false },
      { name = "client_mobile", type = "string", required = false },
      { name = "client_web", type = "string", required = false },
      { name = "activity_name", type = "string", required = false },
      { name = "activity_type", type = "int64", required = false },
      { name = "activity_state", type = "string", required = false },
      { name = "activity_details", type = "string", required = false },
    ]
  }

  http           = { enabled = true, authentication = true, cors = {} }
  worker_binding = { enabled = false }
}

resource "cloudflare_pipeline_sink" "presence_update" {
  account_id = var.account_id
  name       = "presence_update_sink"
  type       = "r2_data_catalog"
  format     = { type = "parquet" }
  schema     = { fields = [] }

  config = {
    account_id = var.account_id
    bucket     = cloudflare_r2_bucket.roppoh_discord_events.name
    namespace  = "discord"
    table_name = "presence_update_events"
    token      = cloudflare_account_token.discord_events_sink.value
  }
}

resource "cloudflare_pipeline" "presence_update" {
  account_id = var.account_id
  name       = "presence_update"
  sql        = "INSERT INTO ${cloudflare_pipeline_sink.presence_update.name} SELECT * FROM ${cloudflare_pipeline_stream.presence_update.name}"
}

# =====================================================================
# guild_presence_snapshot: presence snapshot delivered once per guild on
# every GUILD_CREATE (gateway session start/resume). Same row shape as
# presence_update, kept in a separate table to distinguish "state as of
# reconnect" from live updates.
# =====================================================================

resource "cloudflare_pipeline_stream" "guild_presence_snapshot" {
  account_id = var.account_id
  name       = "guild_presence_snapshot_stream"
  format     = { type = "json" }

  schema = {
    fields = [
      { name = "received_at", type = "timestamp", required = true },
      { name = "guild_id", type = "string", required = true },
      { name = "user_id", type = "string", required = true },
      { name = "status", type = "string", required = false },
      { name = "client_desktop", type = "string", required = false },
      { name = "client_mobile", type = "string", required = false },
      { name = "client_web", type = "string", required = false },
      { name = "activity_name", type = "string", required = false },
      { name = "activity_type", type = "int64", required = false },
      { name = "activity_state", type = "string", required = false },
      { name = "activity_details", type = "string", required = false },
    ]
  }

  http           = { enabled = true, authentication = true, cors = {} }
  worker_binding = { enabled = false }
}

resource "cloudflare_pipeline_sink" "guild_presence_snapshot" {
  account_id = var.account_id
  name       = "guild_presence_snapshot_sink"
  type       = "r2_data_catalog"
  format     = { type = "parquet" }
  schema     = { fields = [] }

  config = {
    account_id = var.account_id
    bucket     = cloudflare_r2_bucket.roppoh_discord_events.name
    namespace  = "discord"
    table_name = "guild_presence_snapshot_events"
    token      = cloudflare_account_token.discord_events_sink.value
  }
}

resource "cloudflare_pipeline" "guild_presence_snapshot" {
  account_id = var.account_id
  name       = "guild_presence_snapshot"
  sql        = "INSERT INTO ${cloudflare_pipeline_sink.guild_presence_snapshot.name} SELECT * FROM ${cloudflare_pipeline_stream.guild_presence_snapshot.name}"
}

# =====================================================================
# voice_state_update: discordgo.VoiceStateUpdate events.
# =====================================================================

resource "cloudflare_pipeline_stream" "voice_state_update" {
  account_id = var.account_id
  name       = "voice_state_update_stream"
  format     = { type = "json" }

  schema = {
    fields = [
      { name = "received_at", type = "timestamp", required = true },
      { name = "guild_id", type = "string", required = true },
      { name = "user_id", type = "string", required = true },
      { name = "channel_id", type = "string", required = false },
      { name = "session_id", type = "string", required = false },
      { name = "self_mute", type = "bool", required = false },
      { name = "self_deaf", type = "bool", required = false },
      { name = "mute", type = "bool", required = false },
      { name = "deaf", type = "bool", required = false },
    ]
  }

  http           = { enabled = true, authentication = true, cors = {} }
  worker_binding = { enabled = false }
}

resource "cloudflare_pipeline_sink" "voice_state_update" {
  account_id = var.account_id
  name       = "voice_state_update_sink"
  type       = "r2_data_catalog"
  format     = { type = "parquet" }
  schema     = { fields = [] }

  config = {
    account_id = var.account_id
    bucket     = cloudflare_r2_bucket.roppoh_discord_events.name
    namespace  = "discord"
    table_name = "voice_state_update_events"
    token      = cloudflare_account_token.discord_events_sink.value
  }
}

resource "cloudflare_pipeline" "voice_state_update" {
  account_id = var.account_id
  name       = "voice_state_update"
  sql        = "INSERT INTO ${cloudflare_pipeline_sink.voice_state_update.name} SELECT * FROM ${cloudflare_pipeline_stream.voice_state_update.name}"
}

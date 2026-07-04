output "presence_update_ingest_endpoint" {
  description = "HTTP ingest endpoint for live PresenceUpdate events"
  value       = cloudflare_pipeline_stream.presence_update.endpoint
}

output "guild_presence_snapshot_ingest_endpoint" {
  description = "HTTP ingest endpoint for the GuildCreate startup presence snapshot"
  value       = cloudflare_pipeline_stream.guild_presence_snapshot.endpoint
}

output "voice_state_update_ingest_endpoint" {
  description = "HTTP ingest endpoint for VoiceStateUpdate events"
  value       = cloudflare_pipeline_stream.voice_state_update.endpoint
}

output "discord_events_ingest_token" {
  description = "Bearer token (Pipelines Send) for discord-gateway-proxy's HTTP ingest requests, shared across all three streams"
  value       = cloudflare_account_token.discord_events_ingest.value
  sensitive   = true
}

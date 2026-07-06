output "github_actions_workers_deploy_token" {
  description = "Cloudflare API token for GitHub Actions Workers deploy (set as CLOUDFLARE_API_TOKEN repo secret)"
  value       = module.api_token.github_actions_workers_deploy_token
  sensitive   = true
}

output "ollama_service_token_client_id" {
  description = "CF-Access-Client-Id header value for Ollama API access"
  value       = module.zero_trust.ollama_service_token_client_id
  sensitive   = true
}

output "ollama_service_token_client_secret" {
  description = "CF-Access-Client-Secret header value for Ollama API access"
  value       = module.zero_trust.ollama_service_token_client_secret
  sensitive   = true
}

output "presence_update_ingest_endpoint" {
  description = "HTTP ingest endpoint for live PresenceUpdate events"
  value       = module.pipelines.presence_update_ingest_endpoint
}

output "guild_presence_snapshot_ingest_endpoint" {
  description = "HTTP ingest endpoint for the GuildCreate startup presence snapshot"
  value       = module.pipelines.guild_presence_snapshot_ingest_endpoint
}

output "voice_state_update_ingest_endpoint" {
  description = "HTTP ingest endpoint for VoiceStateUpdate events"
  value       = module.pipelines.voice_state_update_ingest_endpoint
}

output "discord_events_ingest_token" {
  description = "Bearer token (Pipelines Send) for discord-gateway-proxy's HTTP ingest requests, shared across all three streams"
  value       = module.pipelines.discord_events_ingest_token
  sensitive   = true
}

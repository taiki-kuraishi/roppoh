output "discord_events_ingest_endpoint" {
  description = "HTTP ingest endpoint for discord-gateway-proxy to POST events to"
  value       = cloudflare_pipeline_stream.discord_events.endpoint
}

output "discord_events_ingest_token" {
  description = "Bearer token (Pipelines Send) for discord-gateway-proxy's HTTP ingest requests"
  value       = cloudflare_account_token.discord_events_ingest.value
  sensitive   = true
}

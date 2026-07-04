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

output "discord_events_ingest_endpoint" {
  description = "HTTP ingest endpoint for discord-gateway-proxy to POST events to"
  value       = module.pipelines.discord_events_ingest_endpoint
}

output "discord_events_ingest_token" {
  description = "Bearer token (Pipelines Send) for discord-gateway-proxy's HTTP ingest requests"
  value       = module.pipelines.discord_events_ingest_token
  sensitive   = true
}

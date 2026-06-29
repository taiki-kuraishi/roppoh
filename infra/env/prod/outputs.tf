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

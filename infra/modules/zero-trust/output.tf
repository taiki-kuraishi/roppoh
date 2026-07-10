output "tunnel_cname" {
  description = "CNAME value for DNS records pointing to the tunnel"
  value       = "${cloudflare_zero_trust_tunnel_cloudflared.n100_k3s.id}.cfargotunnel.com"
}

output "ollama_service_token_client_id" {
  description = "CF-Access-Client-Id header value for Ollama / llama-cpp API access"
  value       = cloudflare_zero_trust_access_service_token.ollama.client_id
  sensitive   = true
}

output "ollama_service_token_client_secret" {
  description = "CF-Access-Client-Secret header value for Ollama / llama-cpp API access"
  value       = cloudflare_zero_trust_access_service_token.ollama.client_secret
  sensitive   = true
}

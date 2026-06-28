output "tunnel_id" {
  description = "n100-k3s tunnel ID"
  value       = cloudflare_zero_trust_tunnel_cloudflared.n100_k3s.id
}

output "tunnel_cname" {
  description = "CNAME value for DNS records pointing to the tunnel"
  value       = "${cloudflare_zero_trust_tunnel_cloudflared.n100_k3s.id}.cfargotunnel.com"
}

variable "zone_name" {
  description = "Cloudflare zone name (e.g. tsar-bmb.org)"
  type        = string
}

variable "tunnel_cname" {
  description = "CNAME target for Cloudflare Tunnel DNS records (e.g. <tunnel-id>.cfargotunnel.com)"
  type        = string
}

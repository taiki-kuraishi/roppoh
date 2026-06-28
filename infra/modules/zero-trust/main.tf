data "cloudflare_zone" "this" {
  filter = {
    name = var.zone_name
  }
}

# ----- Cloudflare Tunnel: n100-k3s -----
# import: terraform import module.zero_trust.cloudflare_zero_trust_tunnel_cloudflared.n100_k3s <account_id>/<tunnel_id>
resource "cloudflare_zero_trust_tunnel_cloudflared" "n100_k3s" {
  account_id = var.account_id
  name       = "n100-k3s"
  # token-based remotely-managed tunnel (config is managed via cloudflared_config below)
  config_src = "cloudflare"
}

resource "cloudflare_zero_trust_tunnel_cloudflared_config" "n100_k3s" {
  account_id = var.account_id
  tunnel_id  = cloudflare_zero_trust_tunnel_cloudflared.n100_k3s.id

  config = {
    ingress = [
      {
        hostname = "grafana.tsar-bmb.org"
        service  = "http://grafana.monitoring.svc.cluster.local:80"
      },
      {
        hostname = "argocd.tsar-bmb.org"
        service  = "https://argocd-server.argocd.svc.cluster.local:443"
        origin_request = {
          no_tls_verify = true
        }
      },
      {
        hostname = "otel.tsar-bmb.org"
        service  = "http://grafana-alloy.monitoring.svc.cluster.local:4318"
      },
      # fallback rule (required: must be last and have no hostname)
      {
        service = "http_status:404"
      },
    ]
  }
}

# ----- DNS CNAME records -----
locals {
  tunnel_cname = "${cloudflare_zero_trust_tunnel_cloudflared.n100_k3s.id}.cfargotunnel.com"
  tunnel_hostnames = [
    "grafana",
    "argocd",
    "otel",
  ]
}

resource "cloudflare_dns_record" "tunnel" {
  for_each = toset(local.tunnel_hostnames)

  zone_id = data.cloudflare_zone.this.zone_id
  name    = "${each.key}.${var.zone_name}"
  type    = "CNAME"
  content = local.tunnel_cname
  proxied = true
  ttl     = 1
}

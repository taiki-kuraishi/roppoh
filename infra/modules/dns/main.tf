data "cloudflare_zone" "this" {
  filter = {
    name = var.zone_name
  }
}

resource "cloudflare_dns_record" "grafana" {
  zone_id = data.cloudflare_zone.this.zone_id
  name    = "grafana.${var.zone_name}"
  type    = "CNAME"
  content = var.tunnel_cname
  proxied = true
  ttl     = 1
}

resource "cloudflare_dns_record" "argocd" {
  zone_id = data.cloudflare_zone.this.zone_id
  name    = "argocd.${var.zone_name}"
  type    = "CNAME"
  content = var.tunnel_cname
  proxied = true
  ttl     = 1
}

resource "cloudflare_dns_record" "otel" {
  zone_id = data.cloudflare_zone.this.zone_id
  name    = "otel.${var.zone_name}"
  type    = "CNAME"
  content = var.tunnel_cname
  proxied = true
  ttl     = 1
}

resource "cloudflare_dns_record" "alloy" {
  zone_id = data.cloudflare_zone.this.zone_id
  name    = "alloy.${var.zone_name}"
  type    = "CNAME"
  content = var.tunnel_cname
  proxied = true
  ttl     = 1
}

resource "cloudflare_dns_record" "ollama" {
  zone_id = data.cloudflare_zone.this.zone_id
  name    = "ollama.${var.zone_name}"
  type    = "CNAME"
  content = var.tunnel_cname
  proxied = true
  ttl     = 1
}

resource "cloudflare_dns_record" "zot" {
  zone_id = data.cloudflare_zone.this.zone_id
  name    = "zot.${var.zone_name}"
  type    = "CNAME"
  content = var.tunnel_cname
  proxied = true
  ttl     = 1
}

resource "cloudflare_dns_record" "openclaw" {
  zone_id = data.cloudflare_zone.this.zone_id
  name    = "openclaw.${var.zone_name}"
  type    = "CNAME"
  content = var.tunnel_cname
  proxied = true
  ttl     = 1
}

resource "cloudflare_dns_record" "hermes" {
  zone_id = data.cloudflare_zone.this.zone_id
  name    = "hermes.${var.zone_name}"
  type    = "CNAME"
  content = var.tunnel_cname
  proxied = true
  ttl     = 1
}

resource "cloudflare_dns_record" "hermes_dashboard" {
  zone_id = data.cloudflare_zone.this.zone_id
  name    = "hermes-dashboard.${var.zone_name}"
  type    = "CNAME"
  content = var.tunnel_cname
  proxied = true
  ttl     = 1
}

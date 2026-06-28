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

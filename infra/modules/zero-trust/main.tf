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
      {
        hostname = "alloy.tsar-bmb.org"
        service  = "http://grafana-alloy.monitoring.svc.cluster.local:12345"
      },
      {
        hostname = "ollama.tsar-bmb.org"
        service  = "http://ollama.ollama.svc.cluster.local:11434"
      },
      # fallback rule (required: must be last and have no hostname)
      {
        service = "http_status:404"
      },
    ]
  }
}

# ----- Cloudflare Access: Ollama -----
# Service Token 認証で API クライアントからのアクセスを制御する
# クライアントは CF-Access-Client-Id / CF-Access-Client-Secret ヘッダを付与してリクエストする
resource "cloudflare_zero_trust_access_service_token" "ollama" {
  account_id = var.account_id
  name       = "ollama"
}

resource "cloudflare_zero_trust_access_application" "ollama" {
  account_id = var.account_id
  name       = "ollama"
  domain     = "ollama.tsar-bmb.org"
  type       = "self_hosted"

  policies = [
    {
      name       = "service-token-only"
      decision   = "non_identity"
      precedence = 1
      include    = [{ service_token = { token_id = cloudflare_zero_trust_access_service_token.ollama.id } }]
    }
  ]
}

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

# ----- Cloudflare Access: alloy -----
resource "cloudflare_zero_trust_access_application" "alloy" {
  account_id                 = var.account_id
  name                       = "alloy"
  domain                     = "alloy.tsar-bmb.org"
  type                       = "self_hosted"
  session_duration           = "730h"
  http_only_cookie_attribute = false
  auto_redirect_to_identity  = false
  enable_binding_cookie      = false
  options_preflight_bypass   = false

  policies = [
    {
      id         = var.kuraishi_only_policy_id
      precedence = 1
    },
  ]
}

# ----- Cloudflare Access: grafana -----
resource "cloudflare_zero_trust_access_application" "grafana" {
  account_id                 = var.account_id
  name                       = "grafana"
  domain                     = "grafana.tsar-bmb.org"
  type                       = "self_hosted"
  session_duration           = "730h"
  http_only_cookie_attribute = false
  auto_redirect_to_identity  = false
  enable_binding_cookie      = false
  options_preflight_bypass   = false

  policies = [
    {
      id         = var.kuraishi_only_policy_id
      precedence = 1
    },
  ]
}

# ----- Cloudflare Access: argocd -----
resource "cloudflare_zero_trust_access_application" "argocd" {
  account_id                 = var.account_id
  name                       = "argocd"
  domain                     = "argocd.tsar-bmb.org"
  type                       = "self_hosted"
  session_duration           = "730h"
  http_only_cookie_attribute = false
  auto_redirect_to_identity  = false
  enable_binding_cookie      = false
  options_preflight_bypass   = false

  policies = [
    {
      id         = var.kuraishi_only_policy_id
      precedence = 1
    },
  ]
}

# ----- Cloudflare Access: emdash -----
resource "cloudflare_zero_trust_access_application" "emdash" {
  account_id                 = var.account_id
  name                       = "emdash"
  domain                     = "emdash.tsar-bmb.org"
  type                       = "self_hosted"
  session_duration           = "730h"
  http_only_cookie_attribute = false
  auto_redirect_to_identity  = false
  enable_binding_cookie      = false
  options_preflight_bypass   = false
  allowed_idps               = ["5c0bf666-fc52-4995-b477-8a105e8f6488"]

  policies = [
    {
      id         = var.kuraishi_only_policy_id
      precedence = 1
    },
    {
      id         = var.tsar_only_policy_id
      precedence = 2
    },
  ]
}

# ----- Cloudflare Access: dokploy -----
resource "cloudflare_zero_trust_access_application" "dokploy" {
  account_id                 = var.account_id
  name                       = "dokploy"
  domain                     = "dokploy.tsar-bmb.org"
  type                       = "self_hosted"
  session_duration           = "24h"
  http_only_cookie_attribute = false
  auto_redirect_to_identity  = false
  enable_binding_cookie      = false
  options_preflight_bypass   = false
  allowed_idps               = ["5c0bf666-fc52-4995-b477-8a105e8f6488", "65687c0c-e5aa-46e4-84f9-78ca8324a401"]

  policies = [
    {
      id         = var.kuraishi_only_policy_id
      precedence = 1
    },
  ]
}

# ----- Cloudflare Access: n100 -----
resource "cloudflare_zero_trust_access_application" "n100" {
  account_id                 = var.account_id
  name                       = "n100"
  domain                     = "n100.tsar-bmb.org"
  type                       = "self_hosted"
  session_duration           = "24h"
  http_only_cookie_attribute = false
  auto_redirect_to_identity  = false
  enable_binding_cookie      = false
  options_preflight_bypass   = false
  allowed_idps               = ["5c0bf666-fc52-4995-b477-8a105e8f6488", "65687c0c-e5aa-46e4-84f9-78ca8324a401"]

  policies = [
    {
      id         = var.kuraishi_only_policy_id
      precedence = 1
    },
  ]
}

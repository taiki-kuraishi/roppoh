# ----- Cloudflare Access: alertmanager -----
resource "cloudflare_zero_trust_access_application" "alertmanager" {
  account_id                 = var.account_id
  name                       = "alertmanager"
  domain                     = "alertmanager.tsar-bmb.org"
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

# ----- Cloudflare Access: Ollama -----
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

# ----- Cloudflare Access: llama-cpp -----
# ollama と同じ Service Token で認証する(token_id を共有、ヘッダー値を使い回せる)
resource "cloudflare_zero_trust_access_application" "llama_cpp" {
  account_id = var.account_id
  name       = "llama-cpp"
  domain     = "llama-cpp.tsar-bmb.org"
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

# ----- Cloudflare Access: zot -----
resource "cloudflare_zero_trust_access_application" "zot" {
  account_id                 = var.account_id
  name                       = "zot"
  domain                     = "zot.tsar-bmb.org"
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

# ----- Cloudflare Access: dev-pod (SSH) -----
# Zed の SSH リモート開発先。`cloudflared access ssh --hostname dev-pod.tsar-bmb.org`
# 経由で SSO 認証してから 22 番に到達する。
resource "cloudflare_zero_trust_access_application" "dev_pod" {
  account_id                 = var.account_id
  name                       = "dev-pod"
  domain                     = "dev-pod.tsar-bmb.org"
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

# dev-pod-orca(dev-pod 上の Orca Remote Server、6768番)には Cloudflare Access を
# かけない。Orca mobile app は WebSocket でペアリングするが、Access のブラウザ SSO
# リダイレクトを処理できずハンドシェイクが確立しない。認証はペアリング URL に
# 埋め込まれたトークン(orca serve --mobile-pairing が発行)自体に委ねる。

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

# ----- Cloudflare Access: argo-workflow -----
# Argo Workflows UI。cloudflared 経由で argo-workflows-server(2746)に到達する。
# argo-server は --auth-mode=server で自前 SSO を持たないため、この Access が唯一の認証ゲート。
resource "cloudflare_zero_trust_access_application" "argo_workflow" {
  account_id                 = var.account_id
  name                       = "argo-workflow"
  domain                     = "argo-workflow.tsar-bmb.org"
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

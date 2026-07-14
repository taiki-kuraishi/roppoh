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
        hostname = "alertmanager.tsar-bmb.org"
        service  = "http://grafana-mimir-alertmanager.monitoring.svc.cluster.local:8080"
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
      {
        hostname = "llama-cpp.tsar-bmb.org"
        service  = "http://llama-cpp.llama-cpp.svc.cluster.local:8080"
      },
      {
        hostname = "zot.tsar-bmb.org"
        service  = "http://zot.zot.svc.cluster.local:5000"
      },
      {
        hostname = "openclaw.tsar-bmb.org"
        service  = "http://openclaw.openclaw.svc.cluster.local:18789"
      },
      {
        hostname = "hermes.tsar-bmb.org"
        service  = "http://hermes-agent.hermes-agent.svc.cluster.local:8642"
      },
      {
        hostname = "hermes-dashboard.tsar-bmb.org"
        service  = "http://hermes-agent.hermes-agent.svc.cluster.local:9119"
      },
      # dev-pod: Zed の SSH リモート開発先。cloudflared access ssh 経由で 22 番に到達する。
      {
        hostname = "dev-pod.tsar-bmb.org"
        service  = "ssh://dev-pod.dev-pod.svc.cluster.local:22"
      },
      # dev-pod-orca: dev-pod 上で動く Orca Remote Server(claude コンテナ、6768番)。
      {
        hostname = "dev-pod-orca.tsar-bmb.org"
        service  = "http://dev-pod.dev-pod.svc.cluster.local:6768"
      },
      # argo-workflow: Argo Workflows UI(server は --auth-mode=server / secure=false で平文 HTTP)。
      {
        hostname = "argo-workflow.tsar-bmb.org"
        service  = "http://argo-workflows-server.argo.svc.cluster.local:2746"
      },
      # llama-swap: llama-swap の Web UI(/ui)。llama-cpp と同一 Service だが、
      # こちらは kuraishi-only のメール SSO でブラウザアクセスさせる(API 用の
      # llama-cpp.tsar-bmb.org は service-token のまま温存)。
      {
        hostname = "llama-swap.tsar-bmb.org"
        service  = "http://llama-cpp.llama-cpp.svc.cluster.local:8080"
      },
      # fallback rule (required: must be last and have no hostname)
      {
        service = "http_status:404"
      },
    ]
  }
}

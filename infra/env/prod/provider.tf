provider "cloudflare" {}

# 認証は env 変数 TAILSCALE_OAUTH_CLIENT_ID / TAILSCALE_OAUTH_CLIENT_SECRET から読む
# (.env.sops.yaml → mise の _.file=".env" 経由で注入。Cloudflare provider と同じ作法)。
provider "tailscale" {}

output "github_actions_workers_deploy_token" {
  description = "Cloudflare API token for GitHub Actions Workers deploy"
  value       = cloudflare_account_token.github_actions_workers_deploy.value
  sensitive   = true
}

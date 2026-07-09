output "roppoh_emdash_media_name" {
  description = "roppoh-emdash-media R2 bucket name"
  value       = cloudflare_r2_bucket.roppoh_emdash_media.name
}

output "roppoh_grafana_loki_name" {
  description = "roppoh-grafana-loki R2 bucket name"
  value       = cloudflare_r2_bucket.roppoh_grafana_loki.name
}

output "roppoh_grafana_mimir_blocks_name" {
  description = "roppoh-grafana-mimir-blocks R2 bucket name"
  value       = cloudflare_r2_bucket.roppoh_grafana_mimir_blocks.name
}

output "roppoh_grafana_mimir_ruler_name" {
  description = "roppoh-grafana-mimir-ruler R2 bucket name"
  value       = cloudflare_r2_bucket.roppoh_grafana_mimir_ruler.name
}

output "roppoh_grafana_mimir_alertmanager_name" {
  description = "roppoh-grafana-mimir-alertmanager R2 bucket name"
  value       = cloudflare_r2_bucket.roppoh_grafana_mimir_alertmanager.name
}

output "roppoh_grafana_tempo_name" {
  description = "roppoh-grafana-tempo R2 bucket name"
  value       = cloudflare_r2_bucket.roppoh_grafana_tempo.name
}

output "roppoh_minecraft_world_backup_name" {
  description = "roppoh-minecraft-world-backup R2 bucket name"
  value       = cloudflare_r2_bucket.roppoh_minecraft_world_backup.name
}

# R2 S3 互換資格情報(k8s minecraft Secret の R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY へ手動で貼る)。
output "minecraft_world_backup_r2_access_key_id" {
  description = "R2 S3 Access Key ID (= account token id) for minecraft world backup"
  value       = cloudflare_account_token.minecraft_world_backup_r2.id
  sensitive   = true
}

output "minecraft_world_backup_r2_secret_access_key" {
  description = "R2 S3 Secret Access Key (= sha256 of account token value) for minecraft world backup"
  value       = sha256(cloudflare_account_token.minecraft_world_backup_r2.value)
  sensitive   = true
}

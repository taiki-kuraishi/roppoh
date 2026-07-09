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

output "roppoh_better_auth_id" {
  description = "roppoh-better-auth D1 database ID"
  value       = cloudflare_d1_database.roppoh_better_auth.id
}

output "roppoh_emdash_database_id" {
  description = "roppoh-emdash-database D1 database ID"
  value       = cloudflare_d1_database.roppoh_emdash_database.id
}

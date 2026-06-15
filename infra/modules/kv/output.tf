output "roppoh_emdash_id" {
  description = "roppoh-emdash-kv KV namespace ID"
  value       = cloudflare_workers_kv_namespace.roppoh_emdash.id
}

output "roppoh_emdash_title" {
  description = "roppoh-emdash-kv KV namespace title"
  value       = cloudflare_workers_kv_namespace.roppoh_emdash.title
}

output "minecraft_node_auth_key" {
  description = "Tailscale auth key for the k8s tailscale node (paste into k8s/secrets/tailscale sops Secret TS_AUTHKEY)"
  value       = tailscale_tailnet_key.minecraft.key
  sensitive   = true
}

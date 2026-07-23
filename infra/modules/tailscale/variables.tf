variable "tag" {
  description = "ACL tag applied to the Minecraft Tailscale node (must be defined in tagOwners)"
  type        = string
  default     = "tag:minecraft"
}

variable "auth_key_expiry_seconds" {
  description = "Auth key expiry in seconds (Tailscale max is 90 days = 7776000)"
  type        = number
  default     = 7776000
}

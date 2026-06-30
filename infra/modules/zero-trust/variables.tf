variable "account_id" {
  description = "Cloudflare account ID"
  type        = string
}

variable "kuraishi_only_policy_id" {
  description = "Cloudflare Access reusable policy ID (kuraishi-only)"
  type        = string
  default     = "0a00d985-32e3-4ce8-8a2d-5b03e5c06a38"
}

variable "tsar_only_policy_id" {
  description = "Cloudflare Access reusable policy ID (tsar-only)"
  type        = string
  default     = "1a2f3bc4-516b-4fbe-ba82-c233199a8712"
}

variable "account_id" {
  description = "Cloudflare account ID"
  type        = string
}

variable "zone_name" {
  description = "Cloudflare zone name for custom domain Workers routes"
  type        = string
  default     = "tsar-bmb.org"
}

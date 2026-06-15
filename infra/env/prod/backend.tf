terraform {
  backend "s3" {
    bucket = "roppoh-terraform-state"
    key    = "env/prod/terraform.tfstate"
    region = "auto"

    # Variables cannot be referenced in backend blocks, so account_id is hardcoded
    endpoints = {
      s3 = "https://bd1a33a9922e50b3afff5a2f21ad52d0.r2.cloudflarestorage.com"
    }

    # Disable various checks because R2 is not AWS
    skip_credentials_validation = true
    skip_metadata_api_check     = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
    skip_s3_checksum            = true
    use_path_style              = true

    # S3 native locking (works with R2's conditional write)
    use_lockfile = true
  }
}

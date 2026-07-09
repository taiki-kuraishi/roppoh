resource "cloudflare_r2_bucket" "roppoh_emdash_media" {
  account_id = var.account_id
  name       = "roppoh-emdash-media"
}

# ----- Grafana LGTM stack -----
resource "cloudflare_r2_bucket" "roppoh_grafana_loki" {
  account_id = var.account_id
  name       = "roppoh-grafana-loki"
}

resource "cloudflare_r2_bucket" "roppoh_grafana_mimir_blocks" {
  account_id = var.account_id
  name       = "roppoh-grafana-mimir-blocks"
}

resource "cloudflare_r2_bucket" "roppoh_grafana_mimir_ruler" {
  account_id = var.account_id
  name       = "roppoh-grafana-mimir-ruler"
}

resource "cloudflare_r2_bucket" "roppoh_grafana_mimir_alertmanager" {
  account_id = var.account_id
  name       = "roppoh-grafana-mimir-alertmanager"
}

resource "cloudflare_r2_bucket" "roppoh_grafana_tempo" {
  account_id = var.account_id
  name       = "roppoh-grafana-tempo"
}

# ----- Minecraft world backup -----
# n100(dokploy)から k8s へ移行した Minecraft サーバーの world データを
# k8s CronJob が GFS(世代)方式でバックアップする宛先。
resource "cloudflare_r2_bucket" "roppoh_minecraft_world_backup" {
  account_id = var.account_id
  name       = "roppoh-minecraft-world-backup"
}

# GFS 世代管理: prefix ごとに age(経過時間)ベースで自動削除する。
# CronJob 側が日次で daily/、月曜に weekly/、月初に monthly/ へアップロードし、
# 実際の削除はこのライフサイクルルールに委譲する(max_age の単位は「秒」)。
#   - daily/   : 7 日で失効(1 週間分の日次)
#   - weekly/  : 31 日で失効(1 ヶ月分の週次=月曜)
#   - monthly/ : ルールを定義しない = 無期限保持(その月の最初のバックアップ)
resource "cloudflare_r2_bucket_lifecycle" "roppoh_minecraft_world_backup" {
  account_id  = var.account_id
  bucket_name = cloudflare_r2_bucket.roppoh_minecraft_world_backup.name
  rules = [
    {
      id      = "expire-daily-7d"
      enabled = true
      conditions = {
        prefix = "daily/"
      }
      delete_objects_transition = {
        condition = {
          type    = "Age"
          max_age = 604800 # 7 日
        }
      }
    },
    {
      id      = "expire-weekly-31d"
      enabled = true
      conditions = {
        prefix = "weekly/"
      }
      delete_objects_transition = {
        condition = {
          type    = "Age"
          max_age = 2678400 # 31 日
        }
      }
    },
  ]
}

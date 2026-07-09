#!/usr/bin/env bash
# Minecraft world の GFS(世代)バックアップを R2 へアップロードする。
#   - 毎日 daily/ にアップロード(R2 ライフサイクルで 7 日後に失効)
#   - 月曜は weekly/ にもアップロード(同 31 日後に失効)
#   - 月初(1 日)は monthly/ にもアップロード(無期限保持)
# 実際の削除は Terraform 管理の R2 バケットライフサイクルに委譲する。
set -euo pipefail

# TZ 環境変数(CronJob 側で Asia/Tokyo を設定)に従う。曜日・日付の判定を
# CronJob の timeZone と揃えるため、UTC ではなくローカルタイムで計算する。
TS=$(date +%Y-%m-%dT%H%M%S%z)
DOW=$(date +%u) # 1=Mon .. 7=Sun
DOM=$(date +%d) # 01 .. 31
FILE="minecraft-world-${TS}.tar.gz"
OUT="/tmp/${FILE}"

echo "[backup] flushing world via RCON (${RCON_HOST}:${RCON_PORT:-25575})"
rcon-cli save-off
rcon-cli save-all flush
sync

echo "[backup] archiving /data -> ${OUT}"
# 再取得可能な jar/library/cache は除外し、world と設定のみを固める。
tar -C /data \
  --exclude='./cache' \
  --exclude='./libraries' \
  --exclude='./versions' \
  --exclude='./logs' \
  --exclude='./*.jar' \
  -czf "${OUT}" \
  world \
  server.properties \
  ops.json \
  whitelist.json \
  banned-ips.json \
  banned-players.json \
  usercache.json

# アーカイブ完了後は必ず autosave を戻す。
rcon-cli save-on

echo "[backup] uploading to r2:${BUCKET}/daily/${FILE}"
rclone copyto "${OUT}" "r2:${BUCKET}/daily/${FILE}"

if [ "${DOW}" = "1" ]; then
  echo "[backup] Monday -> also uploading to weekly/"
  rclone copyto "${OUT}" "r2:${BUCKET}/weekly/${FILE}"
fi

if [ "${DOM}" = "01" ]; then
  echo "[backup] first of month -> also uploading to monthly/"
  rclone copyto "${OUT}" "r2:${BUCKET}/monthly/${FILE}"
fi

rm -f "${OUT}"
echo "[backup] done: ${FILE}"

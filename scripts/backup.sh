#!/usr/bin/env sh
set -eu

COMPOSE="${COMPOSE:-docker compose}"
BACKUP_ROOT="${BACKUP_ROOT:-backups}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
BACKUP_S3_URI="${BACKUP_S3_URI:-}"
BACKUP_S3_STORAGE_CLASS="${BACKUP_S3_STORAGE_CLASS:-STANDARD_IA}"
STAMP="$(date -u +%Y%m%d-%H%M%S)"
TARGET="${BACKUP_ROOT}/${STAMP}"
ARCHIVE="${TARGET}.tgz"

mkdir -p "$TARGET"

CURRENT_APP_IMAGE="$(docker inspect --format '{{.Config.Image}}' "$($COMPOSE ps -q app)" 2>/dev/null || true)"

cat > "${TARGET}/manifest.env" <<EOF
BACKUP_FORMAT_VERSION=2
BACKUP_CREATED_AT=${STAMP}
BACKUP_REASON=${BACKUP_REASON:-manual}
APP_IMAGE=${CURRENT_APP_IMAGE}
GIT_COMMIT=$(git rev-parse HEAD 2>/dev/null || true)
EOF

echo "Creating consistent Postgres custom-format dump..."
$COMPOSE exec -T postgres sh -c 'pg_dump --format=custom --no-owner --no-acl -U "$POSTGRES_USER" "$POSTGRES_DB"' > "${TARGET}/payload-postgres.dump"

echo "Creating persistent runtime-data backup..."
$COMPOSE exec -T app sh -c 'mkdir -p /app/data && tar czf - -C /app data' > "${TARGET}/app-runtime-data.tgz"

KUMA_RESTART=false
restart_kuma() {
  if [ "$KUMA_RESTART" = true ]; then
    $COMPOSE up -d uptime-kuma >/dev/null
  fi
}
trap restart_kuma EXIT HUP INT TERM

if [ -n "$($COMPOSE ps --status running -q uptime-kuma)" ]; then
  echo "Stopping Uptime Kuma briefly for a consistent SQLite backup..."
  $COMPOSE stop uptime-kuma >/dev/null
  KUMA_RESTART=true
fi

$COMPOSE run --rm --no-deps --entrypoint sh uptime-kuma -c 'tar czf - -C /app data' > "${TARGET}/uptime-kuma-data.tgz"
restart_kuma
KUMA_RESTART=false
trap - EXIT HUP INT TERM

if [ -d .translation-work ]; then
  tar czf "${TARGET}/translation-work.tgz" .translation-work
fi

if command -v sha256sum >/dev/null 2>&1; then
  (cd "$TARGET" && sha256sum ./* > SHA256SUMS)
fi

tar czf "$ARCHIVE" -C "$BACKUP_ROOT" "$STAMP"

if [ -n "$BACKUP_S3_URI" ]; then
  command -v aws >/dev/null 2>&1 || { echo "aws CLI is required for BACKUP_S3_URI" >&2; exit 1; }
  echo "Uploading encrypted backup archive to ${BACKUP_S3_URI%/}/..."
  aws s3 cp "$ARCHIVE" "${BACKUP_S3_URI%/}/$(basename "$ARCHIVE")" \
    --sse AES256 \
    --storage-class "$BACKUP_S3_STORAGE_CLASS"
else
  echo "BACKUP_S3_URI is not configured; keeping this backup on the VPS temporarily."
fi

if [ "$BACKUP_RETENTION_DAYS" -gt 0 ] 2>/dev/null; then
  find "$BACKUP_ROOT" -mindepth 1 -maxdepth 1 -type d -mtime "+$BACKUP_RETENTION_DAYS" -exec rm -rf -- {} +
  find "$BACKUP_ROOT" -mindepth 1 -maxdepth 1 -type f -name '*.tgz' -mtime "+$BACKUP_RETENTION_DAYS" -delete
fi

echo "Backup written to ${TARGET}"
echo "BACKUP_DIR=${TARGET}"

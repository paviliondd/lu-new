#!/usr/bin/env sh
set -eu

if [ "${CONFIRM_RESTORE:-}" != "yes" ]; then
  echo "Usage: CONFIRM_RESTORE=yes scripts/restore.sh ./backups/YYYYMMDD-HHMMSS"
  exit 1
fi

BACKUP_DIR="${1:-}"
COMPOSE="${COMPOSE:-docker compose}"

if [ -z "$BACKUP_DIR" ] || [ ! -d "$BACKUP_DIR" ]; then
  echo "Backup directory not found."
  exit 1
fi

echo "Restoring Postgres database..."
$COMPOSE exec -T postgres sh -c 'psql -U "$POSTGRES_USER" "$POSTGRES_DB"' < "${BACKUP_DIR}/payload-postgres.sql"

echo "Restoring Payload media..."
$COMPOSE exec -T app sh -c 'mkdir -p /app/public && tar xzf - -C /app/public' < "${BACKUP_DIR}/payload-media.tgz"

echo "Restore completed."

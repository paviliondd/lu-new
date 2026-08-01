#!/usr/bin/env sh
set -eu

if [ "${CONFIRM_RESTORE:-}" != "yes" ]; then
  echo "Usage: CONFIRM_RESTORE=yes scripts/restore.sh ./backups/YYYYMMDD-HHMMSS" >&2
  exit 1
fi

BACKUP_DIR="${1:-}"
COMPOSE="${COMPOSE:-docker compose}"

if [ -z "$BACKUP_DIR" ] || [ ! -d "$BACKUP_DIR" ]; then
  echo "Backup directory not found: ${BACKUP_DIR}" >&2
  exit 1
fi

if [ ! -f "${BACKUP_DIR}/payload-postgres.dump" ] && [ ! -f "${BACKUP_DIR}/payload-postgres.sql" ]; then
  echo "Postgres backup is missing." >&2
  exit 1
fi

if [ "${SKIP_SAFETY_BACKUP:-false}" != "true" ]; then
  echo "Creating a safety backup before destructive restore..."
  BACKUP_REASON=pre-restore sh scripts/backup.sh
fi

echo "Stopping services that write application data..."
$COMPOSE stop nginx app uptime-kuma
$COMPOSE up -d postgres redis

echo "Recreating the Payload database..."
$COMPOSE exec -T postgres sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '\''$POSTGRES_DB'\'' AND pid <> pg_backend_pid();"'
$COMPOSE exec -T postgres sh -c 'dropdb --if-exists -U "$POSTGRES_USER" "$POSTGRES_DB" && createdb -U "$POSTGRES_USER" "$POSTGRES_DB"'

if [ -f "${BACKUP_DIR}/payload-postgres.dump" ]; then
  $COMPOSE exec -T postgres sh -c 'pg_restore --no-owner --no-acl -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < "${BACKUP_DIR}/payload-postgres.dump"
else
  $COMPOSE exec -T postgres sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" "$POSTGRES_DB"' < "${BACKUP_DIR}/payload-postgres.sql"
fi

echo "Restoring Payload media and runtime data..."
$COMPOSE run --rm --no-deps --entrypoint sh app -c 'rm -rf /app/public/uploads/* /app/data/*; tar xzf - -C /app/public' < "${BACKUP_DIR}/payload-media.tgz"
if [ -f "${BACKUP_DIR}/app-runtime-data.tgz" ]; then
  $COMPOSE run --rm --no-deps --entrypoint sh app -c 'tar xzf - -C /app' < "${BACKUP_DIR}/app-runtime-data.tgz"
fi

if [ -f "${BACKUP_DIR}/uptime-kuma-data.tgz" ]; then
  echo "Restoring Uptime Kuma data..."
  $COMPOSE run --rm --no-deps --entrypoint sh uptime-kuma -c 'rm -rf /app/data/*; tar xzf - -C /app' < "${BACKUP_DIR}/uptime-kuma-data.tgz"
fi

if [ -f "${BACKUP_DIR}/translation-work.tgz" ]; then
  rm -rf .translation-work
  tar xzf "${BACKUP_DIR}/translation-work.tgz"
fi

echo "Starting the restored stack..."
$COMPOSE up -d --remove-orphans --no-build
$COMPOSE ps
echo "Restore completed from ${BACKUP_DIR}."

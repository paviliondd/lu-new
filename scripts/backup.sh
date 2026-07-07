#!/usr/bin/env sh
set -eu

COMPOSE="${COMPOSE:-docker compose}"
BACKUP_ROOT="${BACKUP_ROOT:-backups}"
STAMP="$(date +%Y%m%d-%H%M%S)"
TARGET="${BACKUP_ROOT}/${STAMP}"

mkdir -p "$TARGET"

echo "Creating Postgres backup..."
$COMPOSE exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > "${TARGET}/payload-postgres.sql"

echo "Creating Payload media backup..."
$COMPOSE exec -T app sh -c 'mkdir -p /app/public/uploads && tar czf - -C /app/public uploads' > "${TARGET}/payload-media.tgz"

echo "Backup written to ${TARGET}"

#!/usr/bin/env sh
set -eu

BACKUP_ROOT="${BACKUP_ROOT:-./backups}"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="${BACKUP_ROOT}/${STAMP}"

mkdir -p "${BACKUP_DIR}"

echo "Creating database backup..."
docker compose exec -T db sh -c 'mariadb-dump -u"$MARIADB_USER" -p"$MARIADB_PASSWORD" "$MARIADB_DATABASE"' \
  > "${BACKUP_DIR}/database.sql"

echo "Creating WordPress uploads backup..."
docker compose exec -T wordpress sh -c 'mkdir -p /var/www/html/wp-content/uploads && tar czf - -C /var/www/html/wp-content uploads' \
  > "${BACKUP_DIR}/uploads.tgz"

echo "Backup complete: ${BACKUP_DIR}"

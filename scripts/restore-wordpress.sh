#!/usr/bin/env sh
set -eu

BACKUP_DIR="${1:-}"

if [ -z "${BACKUP_DIR}" ]; then
  echo "Usage: CONFIRM_RESTORE=yes scripts/restore-wordpress.sh ./backups/YYYYMMDD-HHMMSS"
  exit 1
fi

if [ "${CONFIRM_RESTORE:-}" != "yes" ]; then
  echo "Refusing to restore without CONFIRM_RESTORE=yes."
  echo "Restore overwrites the WordPress database and files in Docker volumes."
  exit 1
fi

if [ ! -f "${BACKUP_DIR}/database.sql" ]; then
  echo "Backup directory must contain database.sql."
  exit 1
fi

UPLOAD_ARCHIVE="${BACKUP_DIR}/uploads.tgz"
LEGACY_FILES_ARCHIVE="${BACKUP_DIR}/wordpress-files.tgz"

if [ ! -f "${UPLOAD_ARCHIVE}" ] && [ ! -f "${LEGACY_FILES_ARCHIVE}" ]; then
  echo "Backup directory must contain uploads.tgz or legacy wordpress-files.tgz."
  exit 1
fi

echo "Restoring database..."
docker compose exec -T db sh -c 'mariadb -u"$MARIADB_USER" -p"$MARIADB_PASSWORD" "$MARIADB_DATABASE"' \
  < "${BACKUP_DIR}/database.sql"

if [ -f "${UPLOAD_ARCHIVE}" ]; then
  echo "Restoring WordPress uploads..."
  docker compose exec -T wordpress sh -c 'mkdir -p /var/www/html/wp-content'
  docker compose exec -T wordpress tar xzf - -C /var/www/html/wp-content \
    < "${UPLOAD_ARCHIVE}"
else
  echo "Restoring legacy WordPress files archive..."
  docker compose exec -T wordpress tar xzf - -C /var/www/html \
    < "${LEGACY_FILES_ARCHIVE}"
fi

echo "Restore complete from: ${BACKUP_DIR}"

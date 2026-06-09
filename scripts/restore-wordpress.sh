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

if [ ! -f "${BACKUP_DIR}/database.sql" ] || [ ! -f "${BACKUP_DIR}/wordpress-files.tgz" ]; then
  echo "Backup directory must contain database.sql and wordpress-files.tgz."
  exit 1
fi

echo "Restoring database..."
docker compose exec -T db sh -c 'mariadb -u"$MARIADB_USER" -p"$MARIADB_PASSWORD" "$MARIADB_DATABASE"' \
  < "${BACKUP_DIR}/database.sql"

echo "Restoring WordPress files/uploads..."
docker compose exec -T wordpress sh -c 'rm -rf /var/www/html/* /var/www/html/.[!.]* /var/www/html/..?*'
docker compose exec -T wordpress tar xzf - -C /var/www/html \
  < "${BACKUP_DIR}/wordpress-files.tgz"

echo "Restore complete from: ${BACKUP_DIR}"

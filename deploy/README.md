# VPS Deployment Guide for linuxunity.com

This deployment runs:

- Caddy reverse proxy with automatic HTTPS.
- Next.js frontend at `https://linuxunity.com/`.
- WordPress backend/admin at `https://linuxunity.com/wp-admin`.
- WordPress REST API at `https://linuxunity.com/wp-json`.
- MariaDB for WordPress data.

The database has no public port. Only ports `80` and `443` are published by Docker.

## DNS

Create these records before starting Caddy:

- `A linuxunity.com -> <VPS_PUBLIC_IP>`
- Optional: `A www.linuxunity.com -> <VPS_PUBLIC_IP>` or `CNAME www -> linuxunity.com`

## First Setup

```bash
cp .env.example .env
nano .env
```

Change every placeholder password in `.env`.

Start the stack:

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f caddy app wordpress db
```

Open:

```text
https://linuxunity.com/wp-admin
```

If WordPress shows the installer, create the admin account in the browser.

Alternative WP-CLI install:

```bash
docker compose --profile tools run --rm wpcli core install \
  --url="$WORDPRESS_SITE_URL" \
  --title="Linux Unity" \
  --admin_user="$WP_ADMIN_USER" \
  --admin_password="$WP_ADMIN_PASSWORD" \
  --admin_email="$WP_ADMIN_EMAIL"
```

Reset an admin password with WP-CLI:

```bash
docker compose --profile tools run --rm wpcli user update "$WP_ADMIN_USER" \
  --user_pass="$WP_ADMIN_PASSWORD"
```

## Import Roadmap Drafts

Create a WordPress Application Password:

```bash
docker compose --profile tools run --rm wpcli user application-password create \
  "$WP_ADMIN_USER" "roadmap-import" --porcelain
```

Put the returned application password in `.env` as `WORDPRESS_APP_PASSWORD`.

Import draft post metadata without deleting existing posts:

```bash
docker compose run --rm --no-deps app node scripts/import-roadmap-to-wordpress.mjs
```

List recent WordPress drafts:

```bash
docker compose run --rm --no-deps app node scripts/list-wordpress-drafts.mjs
```

The public frontend fetches only `publish` posts. Drafts are visible in `/wp-admin`, not on the public blog.

## Daily Operations

Start:

```bash
docker compose up -d
```

Stop:

```bash
docker compose down
```

View logs:

```bash
docker compose logs -f
docker compose logs -f app wordpress caddy db
```

Rebuild frontend after code changes:

```bash
docker compose up -d --build app
docker compose up -d caddy
```

## Backup

```bash
chmod +x scripts/backup-wordpress.sh scripts/restore-wordpress.sh
scripts/backup-wordpress.sh
```

Backups are written to `./backups/<timestamp>/` and include:

- `database.sql`
- `wordpress-files.tgz`

Restore from a backup:

```bash
CONFIRM_RESTORE=yes scripts/restore-wordpress.sh ./backups/YYYYMMDD-HHMMSS
```

Restore overwrites the WordPress database and WordPress files volume. Do not run it unless you intentionally want to roll back.

## Uploads and Permissions

PHP upload limits are configured in `deploy/wordpress/uploads.ini`.

If uploads fail because of permissions:

```bash
docker compose exec wordpress chown -R www-data:www-data /var/www/html/wp-content/uploads
```

## Firewall

Recommended baseline on Ubuntu:

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
ufw status
```

Do not open MariaDB/MySQL ports publicly.

## Safety Notes

- `.env` is ignored by git. Do not commit real secrets.
- Docker volumes hold WordPress files/uploads, MariaDB data, and Caddy certificates.
- `WORDPRESS_DELETE_EXISTING_POSTS=false` is the normal import mode.
- If you intentionally delete WordPress posts during import, the script requires both:
  - `WORDPRESS_DELETE_EXISTING_POSTS=true`
  - `WORDPRESS_DELETE_CONFIRM=delete-posts-only`

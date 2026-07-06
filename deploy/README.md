# VPS Deployment Guide for tesst.linuxunity.com

This deployment runs:

- Nginx reverse proxy.
- Next.js frontend at `https://tesst.linuxunity.com/`.
- WordPress backend/admin at `https://tesst.linuxunity.com/wp-admin`.
- WordPress REST API at `https://tesst.linuxunity.com/?rest_route=/wp/v2`.
- MariaDB for WordPress data.
- Uptime Kuma at `https://kuma.linuxunity.com`.

The database has no public port. Docker publishes the Nginx service on public
HTTP port `80`, HTTPS port `443`, and keeps `127.0.0.1:8080` as a local
diagnostic endpoint. The Nginx container starts in HTTP-only mode until
Let's Encrypt certificates exist under `deploy/certbot/letsencrypt`; after that
it enables the HTTPS server blocks automatically on restart.

## DNS

Create these records before starting Nginx:

- `A tesst.linuxunity.com -> <VPS_PUBLIC_IP>`
- Optional: `A www.tesst.linuxunity.com -> <VPS_PUBLIC_IP>` or `CNAME www.tesst -> tesst.linuxunity.com`
- `A kuma.linuxunity.com -> <VPS_PUBLIC_IP>`

## AWS ECR

The production frontend image is pulled from AWS ECR. Set these values in the
VPS `.env`:

```bash
AWS_DEFAULT_REGION=ap-southeast-1
AWS_ECR_REGISTRY=123456789012.dkr.ecr.ap-southeast-1.amazonaws.com
AWS_ECR_REPOSITORY=cloud-devops-blog
APP_IMAGE=123456789012.dkr.ecr.ap-southeast-1.amazonaws.com/cloud-devops-blog:production
```

Install and configure AWS CLI on the VPS, or attach an IAM instance profile if
the VPS runs on EC2:

```bash
aws ecr get-login-password --region "$AWS_DEFAULT_REGION" \
  | docker login --username AWS --password-stdin "$AWS_ECR_REGISTRY"
```

## First Setup

```bash
cp .env.example .env
nano .env
```

Change every placeholder password in `.env`.

For container-managed Nginx TLS, keep these bind values:

```bash
NGINX_HTTP_BIND=0.0.0.0:80
NGINX_HTTPS_BIND=0.0.0.0:443
NGINX_DIAGNOSTIC_BIND=127.0.0.1:8080
```

Start the stack:

```bash
docker compose pull
docker compose up -d
docker compose ps
docker compose logs -f nginx app wordpress db
```

Check the Docker-side reverse proxy:

```bash
curl -I http://127.0.0.1
curl -I http://127.0.0.1:8080
curl -fsS http://127.0.0.1:8080/api/health
```

## HTTPS Certificates

Make sure DNS points to the VPS and ports `80` and `443` are open. Start Nginx
once in HTTP-only mode so Let's Encrypt can reach the ACME challenge path:

```bash
docker compose up -d nginx
```

Issue certificates for the main site:

```bash
docker compose --profile tools run --rm certbot certonly \
  --webroot \
  --webroot-path /var/www/certbot \
  --email admin@tesst.linuxunity.com \
  --agree-tos \
  --no-eff-email \
  -d tesst.linuxunity.com \
  -d www.tesst.linuxunity.com
```

Optional: issue a separate certificate for Uptime Kuma:

```bash
docker compose --profile tools run --rm certbot certonly \
  --webroot \
  --webroot-path /var/www/certbot \
  --email admin@tesst.linuxunity.com \
  --agree-tos \
  --no-eff-email \
  -d kuma.linuxunity.com
```

Restart Nginx after certificates are created:

```bash
docker compose up -d --force-recreate nginx
```

Renew certificates:

```bash
docker compose --profile tools run --rm certbot renew --webroot --webroot-path /var/www/certbot
docker compose exec nginx nginx -s reload
```

Run the host diagnostic bundle:

```bash
chmod +x scripts/diagnose-host.sh
scripts/diagnose-host.sh
```

Open:

```text
https://tesst.linuxunity.com/wp-admin
https://kuma.linuxunity.com
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

Emergency only: reset an admin password with WP-CLI after you have confirmed the
target user. This intentionally changes WordPress user data:

```bash
docker compose --profile tools run --rm wpcli user update "$WP_ADMIN_USER" \
  --user_pass="$WP_ADMIN_PASSWORD"
```

## Import Roadmap Drafts

Create a WordPress Application Password:

```bash
docker compose --profile tools run --rm wpcli user list --fields=ID,user_login,roles
docker compose --profile tools run --rm wpcli user application-password create \
  "$WP_ADMIN_USER" "roadmap-import" --porcelain
```

Use an administrator account, or an account with permission to edit posts and
manage categories/tags. Put the returned application password in `.env` as
`WORDPRESS_APP_PASSWORD`, and set `WORDPRESS_USERNAME` to that WordPress user.

Check authentication and permissions before importing:

```bash
docker compose run --rm --no-deps app node scripts/check-wordpress-auth.mjs
```

Run a read-only audit before importing:

```bash
docker compose run --rm --no-deps app node scripts/audit-wordpress-state.mjs
```

Import draft post metadata without deleting or overwriting existing posts:

```bash
docker compose run --rm --no-deps app node scripts/import-roadmap-to-wordpress.mjs
```

List recent WordPress drafts:

```bash
docker compose run --rm --no-deps app node scripts/list-wordpress-drafts.mjs
```

The import script is create-only. If a slug already exists in WordPress, it
skips that post and does not change existing content, status, category, tags, or
metadata. The public frontend fetches only `publish` posts. Drafts are visible
in `/wp-admin`, not on the public blog.

If `/wp-json/wp/v2` returns an Apache 404, the app and scripts still use the
WordPress query route form:

```text
http://wordpress?rest_route=/wp/v2
```

This avoids relying on Apache rewrite rules inside the WordPress container.

## Uptime Kuma

Uptime Kuma is routed by Nginx:

```text
https://kuma.linuxunity.com
```

Configure Telegram and Email alerts inside the Uptime Kuma UI. The settings are
stored in the persistent Docker volume `uptime_kuma_data`.

## WordPress Redirect Fix

If `https://tesst.linuxunity.com/wp-admin` redirects to
`https://linuxunity.com/wp-admin`, update both the VPS `.env` and WordPress DB
options:

```bash
docker compose --profile tools run --rm wpcli option update siteurl "https://tesst.linuxunity.com"
docker compose --profile tools run --rm wpcli option update home "https://tesst.linuxunity.com"
docker compose up -d --force-recreate wordpress nginx
```

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
docker compose logs -f app wordpress nginx db
```

Deploy frontend after a new ECR image is available:

```bash
docker compose pull app
docker compose up -d app
docker compose up -d nginx
```

## Backup

```bash
chmod +x scripts/backup.sh scripts/restore.sh scripts/backup-wordpress.sh scripts/restore-wordpress.sh
scripts/backup.sh
```

Backups are written to `./backups/<timestamp>/` and include:

- `database.sql`
- `uploads.tgz`

Restore from a backup:

```bash
CONFIRM_RESTORE=yes scripts/restore.sh ./backups/YYYYMMDD-HHMMSS
```

Restore overwrites the WordPress database and overlays the backed-up uploads.
Do not run it unless you intentionally want to roll back.

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
- Docker volumes hold WordPress files/uploads and MariaDB data.
- The roadmap import is create-only. It skips existing slugs and refuses
  `WORDPRESS_DELETE_EXISTING_POSTS=true`.
- If drafts, content, or admin login look wrong, follow
  `docs/WORDPRESS_DATA_RECOVERY.md` before running any restore or reset command.

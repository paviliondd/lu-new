# Staging local VPS — LinuxUnity

## Current deployment

- Repository: `/home/lu-new`
- Local branch: `staging`
- Source commit: `22f2348` from `origin/develop`
- Compose project: `linuxunity-staging`
- Build mode: local Docker image, no ECR/AWS required
- Preview drafts: `SERIES_PREVIEW_ENABLED=true`
- Public status: HTTPS is active on ports 80/443; HTTP-01 certificate issued for `dev.linuxunity.com`

## DNS required before opening the site

Current DNS is wrong:

    dev.linuxunity.com -> 103.110.85.93

Point the staging A record to this VPS:

    dev.linuxunity.com -> 45.252.250.236

Optional records, only if needed:

    www.dev.linuxunity.com -> 45.252.250.236
    project-dev.linuxunity.com -> 45.252.250.236
    kuma-dev.linuxunity.com -> 45.252.250.236

If a different subdomain is chosen, update `SITE_DOMAIN`, `SITE_WWW_DOMAIN`, `PROJECT_DOMAIN`, `KUMA_DOMAIN`, `NEXT_PUBLIC_SITE_URL` and the OAuth callback URLs in `/home/lu-new/.env`.

## `.env` values

Already configured locally, with values hidden from logs:

    COMPOSE_PROJECT_NAME=linuxunity-staging
    SITE_ENVIRONMENT=staging
    SERIES_PREVIEW_ENABLED=true
    SITE_DOMAIN=dev.linuxunity.com
    SITE_WWW_DOMAIN=www.dev.linuxunity.com
    PROJECT_DOMAIN=project-dev.linuxunity.com
    KUMA_DOMAIN=kuma-dev.linuxunity.com
    APP_IMAGE=cloud-devops-blog-app:staging-local
    LOCAL_APP_IMAGE=cloud-devops-blog-app:staging-local
    POSTGRES_DB=payload_staging
    POSTGRES_USER=payload_staging
    POSTGRES_PASSWORD=<generated staging-only value>
    DATABASE_URL=<generated staging-only PostgreSQL URL>
    PAYLOAD_SECRET=<generated staging-only value>
    REDIS_URL=redis://redis:6379
    REDIS_KEY_PREFIX=linuxunity:staging
    BACKUP_ROOT=./backups-staging

Leave these empty unless the feature is needed:

    GITHUB_CLIENT_ID
    GITHUB_CLIENT_SECRET
    GOOGLE_CLIENT_ID
    GOOGLE_CLIENT_SECRET
    SMTP_HOST
    SMTP_USER
    SMTP_PASSWORD

The staging OAuth app must be separate from production. If comments/login are needed, create OAuth callbacks:

    https://dev.linuxunity.com/api/auth/github/callback
    https://dev.linuxunity.com/api/auth/google/callback

For another domain, replace `dev.linuxunity.com` consistently in `.env` and the OAuth provider settings. Do not copy production database credentials, Payload secret, OAuth secret, SMTP credentials or media volume.

## Operate the stack

Run as `aiwriter`:

    cd /home/lu-new
    docker compose -f docker-compose.yml -f docker-compose.build.yml ps
    docker compose -f docker-compose.yml -f docker-compose.build.yml logs --tail=100 app nginx

Rebuild after source changes:

    cd /home/lu-new
    docker compose -f docker-compose.yml -f docker-compose.build.yml build app nginx
    docker compose -f docker-compose.yml -f docker-compose.build.yml up -d --force-recreate app nginx

Health check:

    curl -fsS -H 'Host: dev.linuxunity.com' http://127.0.0.1/api/health

## TLS after DNS is corrected

Wait until DNS resolves to `45.252.250.236`, then request the certificate:

    cd /home/lu-new
    docker compose -f docker-compose.yml -f docker-compose.build.yml --profile tools run --rm certbot certonly \
      --webroot -w /var/www/certbot \
      -d dev.linuxunity.com \
      -d www.dev.linuxunity.com \
      --email <ADMIN_EMAIL> \
      --agree-tos --no-eff-email
    docker compose -f docker-compose.yml -f docker-compose.build.yml restart nginx

Remove `www.dev.linuxunity.com` if that DNS record is not created. Do not request TLS while the A record points to another server.

## TLS renewal

The certificate is mounted from `deploy/certbot/letsencrypt` and is renewed daily by:

    /etc/cron.d/linuxunity-staging-tls
    /home/lu-new/scripts/renew-staging-tls.sh

The renewal script restarts only the staging Nginx container after Certbot runs. It does not use production certificates.

## Draft workflow in the website

1. Open `/admin` and create/login to the Payload Admin account.
2. Keep each Series and Post at `Status = Draft` while editing.
3. Use the authenticated preview route:

       https://dev.linuxunity.com/vi/series-preview/<series-slug>
       https://dev.linuxunity.com/en/series-preview/<series-slug>

4. Edit the content directly in Payload Admin.
5. Publish manually only when ready. Public routes query published content; the preview route requires an authenticated Payload session and is `noindex`.

No automatic publish, Git push or production deployment is configured by this staging stack.

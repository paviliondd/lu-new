# VPS Deployment Guide

This deployment runs:

- Nginx reverse proxy.
- Next.js frontend and Payload CMS in the same app container.
- Payload admin at `https://tesst.linuxunity.com/admin`.
- Payload REST API at `https://tesst.linuxunity.com/api/payload`.
- Postgres for CMS data.
- A persistent Docker volume for uploaded media at `/app/public/uploads`.
- Uptime Kuma at `https://kuma.linuxunity.com`.

The database has no public port. Docker publishes only Nginx on HTTP/HTTPS and
keeps `127.0.0.1:8080` as a local diagnostic endpoint.

## First Setup

```bash
cp .env.example .env
nano .env
```

Change every placeholder password, especially:

```bash
PAYLOAD_SECRET=change-this-long-random-payload-secret
POSTGRES_DB=payload
POSTGRES_USER=payload
POSTGRES_PASSWORD=change-this-payload-db-password
DATABASE_URL=postgres://payload:change-this-payload-db-password@postgres:5432/payload
```

Start the stack:

```bash
docker compose pull
docker compose up -d
docker compose ps
docker compose logs -f nginx app postgres
```

Check the app:

```bash
curl -fsS http://127.0.0.1:8080/api/health
curl -I http://127.0.0.1:8080/admin
```

## Payload Admin

Open:

```text
https://tesst.linuxunity.com/admin
```

On the first visit, Payload shows the first-user setup screen. Create the admin
account there. After that, editors manage:

- `Posts`: bilingual article content, featured image, SEO, series, tags, and views.
- `Media`: uploaded images used by posts and authors.
- `Authors`: author profiles and avatars.
- `Series`: collection metadata.

Public articles are read from Payload documents with `status=published`. Drafts
remain visible only inside the authenticated admin.

## HTTPS Certificates

Make sure DNS points to the VPS and ports `80` and `443` are open. Start Nginx
once in HTTP-only mode so Let's Encrypt can reach the ACME challenge path:

```bash
docker compose up -d nginx
```

Issue certificates:

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

Restart Nginx:

```bash
docker compose up -d --force-recreate nginx
```

## Backups

Back up these Docker volumes:

- `payload_postgres_data`: Payload database.
- `payload_media`: uploaded images.
- `uptime_kuma_data`: monitoring data.

The app image is stateless; content lives in Postgres and the media volume.

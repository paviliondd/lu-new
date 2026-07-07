# CI/CD Deployment Notes

Current production stack:

- `nginx`: public reverse proxy.
- `app`: Next.js frontend plus Payload CMS admin/API.
- `postgres`: Payload CMS database.
- `uptime-kuma`: monitoring dashboard.
- `certbot`: tools profile for TLS certificate issuance.

Required runtime variables:

```bash
NEXT_PUBLIC_SITE_URL=https://tesst.linuxunity.com
PAYLOAD_SECRET=change-this-long-random-payload-secret
POSTGRES_DB=payload
POSTGRES_USER=payload
POSTGRES_PASSWORD=change-this-payload-db-password
DATABASE_URL=postgres://payload:change-this-payload-db-password@postgres:5432/payload
```

Admin URL:

```text
https://tesst.linuxunity.com/admin
```

Health checks:

```bash
curl -fsS https://tesst.linuxunity.com/api/health
curl -I https://tesst.linuxunity.com/admin
```

Deployment check:

```bash
npm run lint
npm run build
docker compose up -d
docker compose logs -f nginx app postgres
```

Payload content flow is documented in `docs/PAYLOAD_CMS_FLOW.md`.

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

OAuth login for comments:

```bash
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_CALLBACK_URL=https://tesst.linuxunity.com/api/auth/github/callback
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://tesst.linuxunity.com/api/auth/google/callback
```

The OAuth callback must always redirect using `NEXT_PUBLIC_SITE_URL` as the public base,
never the container host name or internal Docker address.

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

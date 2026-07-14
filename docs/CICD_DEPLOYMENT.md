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

## ECR image flow

The production workflow builds the application once on GitHub Actions and pushes the
same image with three tags:

- `latest`: newest verified production build.
- `production`: stable mutable production tag.
- the full Git commit SHA: immutable deployment tag.

Production jobs run only for the `main` branch, including manual workflow dispatches.

The VPS deploy uses the commit SHA tag, pulls it from ECR, and starts Compose with
`--no-build`. This guarantees that the deployed container matches the verified CI
commit and prevents the older VPS CPU from rebuilding Sharp locally.

The Docker dependency stages install Sharp's official WASM runtime, remove the
incompatible native `linux-x64` binary, and fail the image build unless Emscripten is
actually selected. This keeps Payload media processing and Next image optimization
compatible with the VPS x86-64 v1 CPU.

Manual source builds remain available by leaving `DEPLOY_IMAGE_SOURCE` unset (the
default is `build`). Registry deployments must set:

```bash
APP_IMAGE=ACCOUNT.dkr.ecr.REGION.amazonaws.com/REPOSITORY:COMMIT_SHA
DEPLOY_IMAGE_SOURCE=registry
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

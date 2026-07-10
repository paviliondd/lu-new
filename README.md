# LinuxUnity Blog

Next.js 16 blog and Payload CMS backend for LinuxUnity.

## Stack

- Frontend: Next.js App Router, React 19, TypeScript, Tailwind CSS v4.
- Backend CMS: Payload CMS embedded in the same Next.js app.
- Database: Postgres through `@payloadcms/db-postgres`.
- Media: Payload `media` collection stored under `/public/uploads`.
- Production: Docker Compose with Nginx, app, Postgres, Uptime Kuma, and Certbot.

## Local Development

```bash
npm ci
npm run dev
```

Open:

```text
http://localhost:3000
http://localhost:3000/admin
```

Payload needs these variables when you want the admin/database features:

```bash
PAYLOAD_SECRET=change-this-long-random-payload-secret
DATABASE_URL=postgres://payload:change-this-payload-db-password@localhost:5432/payload
```

## Content Flow

Editors manage content at `/admin`.

The public site reads from Payload first, maps Payload documents into the existing frontend `Post` shape, and falls back to local MDX files if Payload is unavailable in development.

Language flow:

- `/vi` reads `titleVi`, `excerptVi`, and `contentVi`.
- `/en` reads `titleEn`, `excerptEn`, and `contentEn`.
- Missing English content falls back to Vietnamese content.

View count flow:

- Article pages call `/api/posts/[slug]/view`.
- The route increments the Payload `posts.views` field.
- If Payload/Postgres is unavailable locally, it falls back to `data/views.json`.

More detail: [Payload CMS Flow](./docs/PAYLOAD_CMS_FLOW.md).

## Repository Structure

```text
src/
  app/                 Next.js App Router routes and route-local components
  app/components/      Shared UI, article UX, layout, and page components
  lib/                 CMS adapters, auth, content, search, stores, utilities
  i18n/                Locale config and metadata helpers
  migrations/          Payload database migrations
content/               Local post/data fallback sources
data/                  Local JSON fallback stores for views, comments, newsletter
public/                Static assets and uploaded media
scripts/               Import, sync, backup, restore, and deployment helpers
deploy/                Nginx, WordPress bridge, Certbot, and deployment assets
docs/                  Operational and architecture documentation
```

## Production

Admin URL:

```text
https://tesst.linuxunity.com/admin
```

Deploy guide:

- [VPS Deployment](./deploy/README.md)
- [CI/CD Deployment](./docs/CICD_DEPLOYMENT.md)

## Verification

```bash
npm run lint
npm run build
```

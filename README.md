# LinuxUnity Blog

LinuxUnity is a bilingual DevOps/cloud publication built as one deployable Next.js and Payload CMS application.

## Stack

- Frontend: Next.js App Router, React 19, TypeScript, Tailwind CSS v4.
- Backend CMS: Payload CMS embedded in the same Next.js app.
- Database: Postgres through `@payloadcms/db-postgres`.
- Cache/runtime support: Redis.
- Media: Payload `media` collection stored in the `payload_media` volume.
- Production: immutable ECR images deployed to Docker Compose with Nginx, app, Postgres, Redis, Uptime Kuma, and Certbot.

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

Editors manage content at `/admin` using a WordPress Gutenberg-like block editor:

- Block-based Lexical editor supporting rich text, headings, lists, checklists, quotes, images, tables, code blocks, terminal blocks, note callouts, file tree blocks, subscript/superscript, and text alignment.
- WordPress-style right sidebar layout for Status & Publication date, Categories, Series, Tags, Featured Image, Excerpt, and Author.
- Mandatory publish validation enforcing title, category, and article content before publishing.
- DB-safe Payload configuration keeping full production Postgres schema compatibility.

The public site treats Payload as authoritative whenever the CMS is reachable. Local MDX/data files are operational fallbacks only when Payload is unavailable or a CMS query fails. A valid empty CMS result stays empty; deleted posts or series must not be resurrected from fallback files.

Language flow:

- `/` and `/vi` read `titleVi`, `excerptVi`, and `contentVi`.
- `/en` reads `titleEn`, `excerptEn`, and `contentEn`.
- Missing English content falls back to Vietnamese content.
- `sitemap.xml` generates localized alternates for both `vi` and `en` locales.

View count flow:

- Article pages call `/api/posts/[slug]/view`.
- The route increments the Payload `posts.views` field.
- If Payload/Postgres is unavailable locally, it falls back to `data/views.json`.

More detail: [Payload CMS Flow](./docs/PAYLOAD_CMS_FLOW.md).

## Repository Structure

```text
src/
  app/                 App Router pages, Payload admin/API routes, metadata icons
  app/components/      Shared UI, page sections, series rows, article UX
  blocks/              Payload Lexical custom blocks
  collections/         Payload collection modules
  lib/                 CMS adapters, auth, cache, content, search, stores
  i18n/                Locale routing and metadata helpers
  migrations/          Payload/Postgres migrations
content/               Local post/data fallback sources
data/                  Local JSON fallback stores for views, comments, newsletter
public/                Static brand assets; production uploads use a volume
scripts/               Import, translation, backup, restore, rollback, deploy tools
deploy/                Nginx and Certbot deployment assets
docs/                  Feature registry, runbooks, diagrams, architecture notes
tests/                 Cross-feature regression tests
```

## Production

Admin URL:

```text
https://linuxunity.com/admin
```

Deploy guide:

- [VPS Deployment](./deploy/README.md)
- [CI/CD Deployment](./docs/CICD_DEPLOYMENT.md)

Production rules:

- GitHub Actions builds and pushes an immutable Git-SHA image to ECR.
- VPS deployment only pulls and starts images with `--no-build`.
- `docker-compose.build.yml` is the explicit local source-build override.
- Deploy creates a pre-migration data backup and records the previous image.
- ECR stores application images; Postgres/media/runtime/Kuma backups are separate and can be copied to S3.
- See the CI/CD runbook for image-only and full-data rollback procedures.

## Verification

```bash
npm run lint
npm test
npm run build
```

# Project Audit

Date: 2026-07-12

## 1. Current Architecture

This project is a Next.js App Router blog and Payload CMS application deployed as a Docker Compose stack.

- Frontend: Next.js 16, React 19, App Router under `src/app`.
- CMS: Payload CMS 3 mounted under `/admin`, `/api/payload`, `/api/graphql`, and `/api/graphql-playground`.
- Database: Postgres 16 through `@payloadcms/db-postgres`.
- Cache/runtime support: Redis for cache/rate-limit related server helpers.
- Reverse proxy: Nginx in Docker Compose.
- Deployment: GitHub Actions builds and pushes an ECR image, then SSH deploys to a VPS.
- Runtime: Dockerfile uses standalone Next output and runs `npm run payload -- migrate` before `node server.js`.

## 2. Main Modules

- `src/payload.config.ts`: Payload collections, editor features, uploads, access rules, hooks, and database adapter.
- `src/lib/cms/payload.ts`: Payload read/write adapter, content rendering, fallback merge, comments, views, and OAuth user upsert.
- `src/app/[lang]`: Localized frontend routes for home, blog, post detail, search, series, feed, and about.
- `src/app/api`: Public and auth APIs for posts, comments, search, auth callbacks, newsletter, health, revalidation, and post views.
- `src/app/components`: UI components for header, footer, pages, article rendering, comments, search, theme, code blocks, images, and Mermaid.
- `src/i18n`: Locale config, metadata, alternates, and localization helpers.
- `src/migrations`: Payload database migrations.
- `scripts`: Import, repair, sync, backup, restore, deploy, and content audit utilities.
- `deploy`: Nginx, certbot, and legacy WordPress migration/support assets.

## 3. Data Flow

1. Editors create content in Payload `/admin`.
2. Payload stores posts, media, authors, series, comments, and users in Postgres.
3. Media uploads are stored under `public/uploads` and mounted as `payload_media` in Docker.
4. Frontend routes call `getCmsPublishedPosts`, `getCmsPostBySlug`, and `getCmsSeries`.
5. Payload content is mapped into the existing `Post` and `Series` shapes.
6. If Payload or Postgres is unavailable, frontend data falls back to local content/data sources.
7. Rich text is converted to HTML, sanitized, highlighted, enhanced with code copy controls, Mermaid rendering, and image enhancement.
8. Comments require OAuth session, are created as pending, and only approved comments are public.
9. Deployment builds an image in CI, deploys to VPS, runs compose, waits for health, and runs post repair.

## 4. Working Features

- Bilingual public site with default `vi` locale and optional `en` locale.
- Blog list and blog detail pages backed by Payload with local fallback.
- Payload admin editor with rich text, headings, lists, links, uploads, tables, code blocks, terminal blocks, notes, and file tree blocks.
- Code block frontend enhancement with copy, expand, and long-code controls.
- Image uploads and generated image sizes through Payload media.
- SEO metadata, Open Graph fields, JSON-LD article and breadcrumb schema.
- Categories, tags, series, authors, and read time fields.
- Search API and modal UI.
- Dark/light/system theme toggle.
- Comment submission through GitHub or Google OAuth sessions.
- Comment approval workflow through Payload `comments.status`.
- Post view tracking with Payload and local fallback.
- Docker Compose production stack with Nginx, app, Postgres, Redis, Uptime Kuma, and Certbot.
- Production GitHub Actions deployment to ECR and VPS.

## 5. Broken Or Risky Features Found

- No `npm test` script existed before stabilization, so CI could not run the requested test gate.
- Git workflow documentation referenced `develop`, but the local branch did not exist before stabilization.
- Several existing Vietnamese UI/doc strings display as mojibake when read from the shell. This may be a file encoding, terminal decoding, or existing source text issue. Do not mass-fix without a focused encoding audit.
- Payload config uses `db.push: true` together with migrations. This can be convenient but increases schema drift risk in production.
- `scripts/deploy.sh` performs `git reset --hard origin/main` on the VPS. This is expected for deploy, but dangerous if local production edits exist on the server.
- Comment fallback JSON files under `data/` are useful for development but are not a production-grade moderation store.

## 6. Important Files

- `AGENTS.md`
- `package.json`
- `package-lock.json`
- `next.config.ts`
- `src/payload.config.ts`
- `src/lib/cms/payload.ts`
- `src/lib/auth/session.ts`
- `src/lib/auth/oauth.ts`
- `src/app/api/comments/route.ts`
- `src/app/api/auth/github/route.ts`
- `src/app/api/auth/github/callback/route.ts`
- `src/app/api/auth/google/route.ts`
- `src/app/api/auth/google/callback/route.ts`
- `src/app/[lang]/blog/[slug]/page.tsx`
- `src/app/components/RichTextRenderer/Renderer.tsx`
- `src/app/components/CodeBlock/CodeBlock.tsx`
- `src/app/components/Comments.tsx`
- `src/app/components/ThemeToggle.tsx`
- `src/i18n/config.ts`
- `src/i18n/metadata.ts`
- `src/migrations/*`
- `.env.example`
- `Dockerfile`
- `docker-compose.yml`
- `deploy/nginx/default.conf`
- `scripts/deploy.sh`
- `.github/workflows/deploy-production.yml`

## 7. High Regression Risk Areas

- `src/payload.config.ts`: collection fields define the database/API/admin contract.
- `src/lib/cms/payload.ts`: maps CMS documents to frontend shape and contains fallback behavior.
- Rich text rendering and sanitization: incorrect changes can break editor output, code blocks, images, Mermaid, or SEO HTML.
- `src/i18n/config.ts` and localized routes: small route changes can break Vietnamese default routing.
- OAuth session cookies and callback URLs: environment or cookie changes can break login.
- Comments API and Payload comments collection: approval workflow depends on `pending` creation and `approved` public reads.
- Dockerfile startup command: migrations and standalone server boot happen here.
- `scripts/deploy.sh`: production deploy is destructive by design on the VPS checkout.
- GitHub Actions deploy workflow: missing gates can allow broken builds to deploy.

# AI Project Constitution

This file is mandatory context for Codex and any AI agent working in this repo.

## Architecture Rules

- Do not change the current framework stack: Next.js App Router, React, Payload CMS, Postgres, Redis, Docker Compose, and Nginx.
- Do not replace Payload CMS with another CMS.
- Do not change the database schema or Payload collections unless the user explicitly requests it.
- Do not rewrite working components, routes, collections, or deployment scripts.
- Preserve the source-of-truth model: Payload is authoritative whenever reachable; local content/data is used only when Payload is unavailable or a query fails. Never merge deleted CMS entities back from fallback files.
- Preserve the current bilingual routing model: Vietnamese is the default locale and English is optional via `/en`.
- Production images are built in GitHub Actions, stored in ECR under immutable Git SHA tags, and pulled by the VPS. Production Compose must never build from the VPS checkout.

## Feature Protection

The following features are immutable unless the user explicitly requests a change.

### CMS

- WordPress-like Gutenberg editor (Lexical block editor with floating toolbar, checklist, indent, subscript/superscript)
- Gutenberg right sidebar layout (Status & Publish box, Category, Series, Tags, Featured Image, Excerpt, Author in right sidebar)
- Mandatory publish validation (Requires Title VI, Category, and content before publishing)
- DB-safe Payload configuration (Zero schema modifications required for production Postgres stability)
- Rich text editor
- Code block
- Copy code button
- Image handling
- SEO fields
- Categories
- Tags
- Series

### Frontend

- Vietnamese default locale
- English locale
- Responsive design
- Dark/light theme
- SEO rendering
- Shared responsive series-row design on home and series list pages
- Cache-busted App Router `icon.png` and `apple-icon.png` generated from the current brand logo

### User Features

- Comment system
- GitHub OAuth
- Google OAuth
- Comment approval workflow

### Operations

- Pre-deploy backups run before Payload migrations.
- Persistent backup scope includes Postgres, Payload media, runtime JSON data, Uptime Kuma, and translation work.
- ECR is the image rollback source; it is not a database or media backup.
- Image-only rollback must not modify persistent data.
- Full rollback requires explicit confirmation and restores the image recorded in the backup manifest together with persistent data.
- Production deploys use `docker compose up --no-build`; local builds use `docker-compose.build.yml` explicitly.

## Coding Rules

Before coding:

1. Read this `AGENTS.md`.
2. Read the related section in `docs/FEATURES.md`.
3. Read the current implementation files.
4. Check related dependencies and framework behavior.
5. Identify the root cause.
6. Propose a plan and wait for user confirmation before code changes, unless the user already asked to implement directly.

During coding:

1. Modify the minimum number of files.
2. Keep backward compatibility.
3. Preserve all immutable features.
4. Prefer local patterns already used in the repo.
5. Avoid large refactors and unrelated cleanup.

Do not:

- Rewrite an entire file to solve a small bug.
- Refactor unrelated code.
- Delete old code merely to make an error disappear.
- Remove fallback paths without replacing the behavior and documenting the impact.
- Commit directly to `main`.

After coding:

1. Run `npm run lint`.
2. Run `npm test`.
3. Run `npm run build`.
4. Run Docker validation when deployment behavior is touched.
5. Update `docs/AI_CHANGELOG.md`.
6. Summarize changed files, checks run, and remaining risks.

## Branch Rules

- `main` is production only.
- `develop` is integration and validation.
- Feature work must happen on `feature/*`, `bugfix/*`, `hotfix/*`, or `codex/*`.
- Prefer `feature/*`, `bugfix/*`, or `hotfix/*` for repository work; use `codex/*` only when explicitly appropriate.
- Codex must not commit directly to `main`.

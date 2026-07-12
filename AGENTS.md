# AI Project Constitution

This file is mandatory context for Codex and any AI agent working in this repo.

## Architecture Rules

- Do not change the current framework stack: Next.js App Router, React, Payload CMS, Postgres, Redis, Docker Compose, and Nginx.
- Do not replace Payload CMS with another CMS.
- Do not change the database schema or Payload collections unless the user explicitly requests it.
- Do not rewrite working components, routes, collections, or deployment scripts.
- Preserve the existing fallback model: Payload CMS is primary, local content/data files are fallback.
- Preserve the current bilingual routing model: Vietnamese is the default locale and English is optional via `/en`.

## Feature Protection

The following features are immutable unless the user explicitly requests a change.

### CMS

- WordPress-like editor
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

### User Features

- Comment system
- GitHub OAuth
- Google OAuth
- Comment approval workflow

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
- Codex must not commit directly to `main`.

# Repository Structure

## Current runtime boundaries

The website is intentionally a single deployable Next.js and Payload CMS application. Splitting it into separate frontend and backend repositories would duplicate types, complicate Payload's embedded admin/API routes, and add deployment overhead without a current scaling benefit.

```text
src/
  app/                 Next.js routes, UI, Payload admin/API adapters, metadata icons
  app/components/      Shared page, article, navigation and series UI
  blocks/              Payload rich-content blocks
  collections/         Payload collection definitions
  lib/                 Server integrations, content access, auth, cache and utilities
  migrations/          Payload/Postgres migrations
  payload.config.ts    Payload composition root
content/               Versioned local fallback content
scripts/               Operational and migration tools
deploy/                Runtime deployment configuration
docs/                  Architecture and operations documentation
tests/                 Cross-feature regression tests
docker-compose.yml     Pull-only production stack
docker-compose.build.yml Explicit local source-build override
```

Runtime state is outside the application image: `payload_postgres_data`,
`payload_media`, `app_runtime_data`, `redis_data`, and `uptime_kuma_data` are persistent Compose
volumes. Payload media is currently stored in `payload_media` and served through the Payload media route; S3/CDN remains disabled until a dedicated migration is scheduled.
`.translation-work` remains a host bind mount.

Payload is the live source of truth. Local content/data is selected only when
Payload cannot be reached or its query fails; a successful empty CMS result is
never filled with deleted fallback entities.

## Recommended gradual organization

Keep one application and move only when a feature is already being changed:

```text
src/
  app/                 Framework-mandated routes and presentation
  cms/                 Future home for blocks, collections and CMS hooks
  server/              Future home for auth, cache and content repositories
  shared/              Future home for framework-neutral types and utilities
infra/
  docker/              Future Docker and Nginx deployment assets
  aws/                 Future IaC for ECS/Lambda or EKS
tools/                 Future operational scripts
```

This is a target boundary, not authorization for a bulk move. Moving directories should be incremental, with import aliases, CI paths, Docker COPY rules, and tests updated in the same feature change. The current `src/app` path must remain because it is required by Next.js App Router.

## Cleanup policy

A file may be removed when it has no static or dynamic runtime reference, is not an operational dependency, is not protected documentation, and is recoverable from Git. Generated build output, local logs, caches, editor state, bundled third-party installers, superseded scripts, and artifacts for an abandoned stack should not be committed.

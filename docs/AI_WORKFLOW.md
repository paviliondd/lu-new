# AI Development Workflow

This workflow is mandatory for Codex and any AI agent.

## Before Coding

1. Read `AGENTS.md`.
2. Read the related feature in `docs/FEATURES.md`.
3. Read the current implementation files.
4. Analyze impact across frontend, backend, Payload CMS, database, API, auth, Docker, CI/CD, and environment variables.
5. Identify root cause before proposing changes.
6. Explain the plan and expected files touched.

## During Coding

1. Work on a non-main branch.
2. Modify minimum files.
3. Keep backward compatibility.
4. Do not remove existing features.
5. Do not change Payload schema unless requested.
6. Do not perform unrelated refactors.
7. Keep immutable features listed in `AGENTS.md` intact.

## After Coding

1. Run `npm run lint`.
2. Run `npm test`.
3. Run `npm run build`.
4. Run Docker build validation when deployment or runtime behavior is touched.
5. Update `docs/AI_CHANGELOG.md`.
6. Provide a summary of changes, checks, and residual risks.

## Change Classification

- Docs-only: update docs and changelog; run lightweight validation when possible.
- Frontend: run lint, test, build; manually check affected pages.
- CMS/schema: inspect migrations, Payload config, generated types, and database impact before changes.
- Auth/comments: test login/session/comment flow and approval behavior.
- Deployment: run lint, test, build, Docker build, and review GitHub Actions dependencies.

## Stop Conditions

Stop and ask the user before continuing if a change would:

- Alter database schema.
- Remove or replace Payload CMS.
- Rewrite a working component.
- Change OAuth providers or callback behavior.
- Remove fallback content/data paths.
- Require production secrets.
- Require destructive Git or database operations.

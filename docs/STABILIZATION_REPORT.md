# Stabilization Report

Date: 2026-07-12

## 1. Files Created

- `AGENTS.md`
- `docs/PROJECT_AUDIT.md`
- `docs/FEATURES.md`
- `docs/AI_CHANGELOG.md`
- `docs/REGRESSION_CHECKLIST.md`
- `docs/AI_WORKFLOW.md`
- `docs/STABILIZATION_REPORT.md`

## 2. Issues Found

- Work was being done from `main`; a local `develop` branch did not exist even though the workflow documentation referenced it.
- CI did not include `npm test`.
- `package.json` did not define a test script.
- CI did not run a separate Docker build validation before the deploy chain.
- Existing Vietnamese strings appear as mojibake in several files when read from the shell.
- Payload uses `db.push: true` while migrations also exist, which increases schema drift risk.
- VPS deploy script intentionally resets the server checkout to `origin/main`; this should only run where no manual production edits are expected.

## 3. Remaining Risks

- No real automated unit/integration tests exist yet. The current test gate is a placeholder that keeps CI structure ready.
- OAuth and comment approval still require manual or end-to-end testing with real provider credentials.
- Docker build validation can be slower in CI because the Dockerfile also runs a Next build.
- Docker CLI was not available in the local workspace, so Docker build validation was configured in CI but not executed locally during this stabilization.
- Encoding should be audited separately before modifying visible Vietnamese copy.
- Payload schema changes still need a strict migration policy before future feature work.

## 4. How To Use Codex From Now On

1. Start every task by reading `AGENTS.md`.
2. Check the impacted feature in `docs/FEATURES.md`.
3. Work from `develop` or a task branch, never directly from `main`.
4. Make the smallest possible change.
5. Preserve all immutable features.
6. Run lint, test, build, and Docker validation when relevant.
7. Update `docs/AI_CHANGELOG.md` for every Codex change.
8. Use `docs/REGRESSION_CHECKLIST.md` before deploy.

## 5. Branch Protection Status

- Local `develop` branch was created from `main`.
- Current work is on `codex/stabilize-ai-workflow`.
- GitHub branch protection rules cannot be enforced from this local workspace. Configure repository settings to require pull requests and passing checks before merging to `main`.

## 6. Verification Run

- `npm run lint`: passed.
- `npm test`: passed with 0 discovered tests.
- `npm run build`: passed.
- `docker build --file ./Dockerfile --tag cloud-devops-blog-app:ci .`: not run locally because Docker CLI was not installed.

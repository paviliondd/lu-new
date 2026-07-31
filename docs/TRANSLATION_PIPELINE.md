# English Translation Pipeline

The pipeline translates Vietnamese Payload posts without changing the Payload schema. It prefers `contentRichVi` and preserves the Lexical/Gutenberg tree while translating only prose-bearing fields. Code, terminal commands, file trees, URLs, IDs, filenames, and media relationships are not sent back as editable translation output.

## Safety model

- `audit` is read-only.
- `translate` requires `--limit` or explicit `--slug` values.
- Translation is a dry run unless `--apply` is present.
- Every run writes an ignored candidate file and a pre-change snapshot under `.translation-work/`.
- `--apply` refuses candidates that change the Lexical structure, omit required English metadata, or appear to retain Vietnamese text.
- Rollback requires both `--apply` and an explicit snapshot path.
- Provider failures are isolated per post and written to a `failures.json` file; successful posts in the same batch are retained.
- Transient API errors are retried with exponential backoff, then the next configured fallback model is attempted.

## Commands

```powershell
npm run content:audit-translations

npm run content:translate -- --limit 3

npm run content:translate -- --limit 3 --apply

node --import tsx scripts/translation-pipeline.mjs `
  --mode rollback `
  --snapshot .translation-work/<run>-snapshot.json `
  --apply
```

Run the three-post command without `--apply` first. Review the generated candidates and `/en` rendering before any database write.

## Docker Compose

The production image contains the translation script and its runtime dependencies. Run it in the existing `app` container so that the Docker-only `postgres` hostname resolves correctly:

```powershell
docker compose exec app npm run content:audit-translations
docker compose exec app npm run content:translate -- --limit 3
docker compose exec app npm run content:translate -- --limit 3 --apply
```

Configure an ordered model fallback list in `.env` when using Agent Router:

```dotenv
OPENAI_TRANSLATION_BASE_URL=https://agentrouter.org/v1
ANTHROPIC_TRANSLATION_BASE_URL=https://agentrouter.org
OPENAI_TRANSLATION_MODELS=claude-opus-5,gpt-5.6-sol,claude-opus-4-8
```

The pipeline routes `claude-*` models through Anthropic Messages at `/v1/messages` and other models through OpenAI Chat Completions at `/v1/chat/completions`. Both protocols reuse `OPENAI_API_KEY` by default; set `ANTHROPIC_API_KEY` only when the Anthropic endpoint has a separate credential.

Probe every configured model before translating. This does not connect to Payload or modify any post:

```powershell
docker compose exec app npm run content:test-translation-api
```

The pipeline translates smaller posts first. Cap unusually large posts and resume only failures from a previous run with:

```powershell
docker compose exec app npm run content:translate -- --limit 3 --max-source-tokens 12000
docker compose exec app npm run content:translate -- --resume .translation-work/<run>-failures.json
```

Exit code `2` means one or more posts failed but the candidate, snapshot, and failure reports were still written. A provider `content-blocked` response skips retries on that model and immediately tries the next configured model.

Candidate and snapshot files are bind-mounted to the host at `.translation-work/`. Always inspect the dry-run candidate before using `--apply`. To roll back an applied run:

```powershell
docker compose exec app node --import tsx scripts/translation-pipeline.mjs `
  --mode rollback `
  --snapshot .translation-work/<run>-snapshot.json `
  --apply
```

Do not run multiple apply jobs concurrently. The pilot sequence should be: audit, dry-run three posts, editorial review, apply those three posts, verify `/en`, then increase the batch size gradually.

## Runtime prerequisite

When `.env` uses Docker DNS such as `postgres`, execute the command inside the Compose network or override `DATABASE_URL` with a reachable, explicitly approved database endpoint. Do not silently replace the production connection string.

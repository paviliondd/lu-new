# Payload CMS Flow

Admin URL:

```text
/admin
```

Public data flow:

1. Editors create or update content in Payload collections.
2. Payload stores structured records in Postgres.
3. Uploaded images are saved through the `media` collection to the persistent local `payload_media` volume and served by the Payload media route. The S3 adapter is temporarily disabled.
4. Frontend pages call `getCmsPublishedPosts` and `getCmsPostBySlug`.
5. Those functions read from Payload first, map documents into the existing `Post` shape, and fall back to local MDX files when Payload is unavailable.
6. `/vi` and `/en` render the same Payload document using `titleVi/contentVi` or `titleEn/contentEn`.
7. Post view tracking is disabled. No frontend request or public increment endpoint exists; the legacy Payload column is hidden and unreadable so existing values remain preserved without a destructive migration.

Collections:

- `posts`: bilingual article body, featured image, SEO, series, tags, services, and labs. The legacy view-count column is retained only for non-destructive schema compatibility and is not exposed or updated.
- `media`: uploaded images for posts and authors.
- `authors`: author profile data and avatar.
- `series`: series metadata shown on listing pages.
- `users`: Payload admin users.

## Schema and data safety

- PostgreSQL records and the `payload_postgres_data` volume are authoritative; application images do not contain CMS data.
- Presentation changes must not alter collection fields. In particular, do not replace existing flat author fields such as `linkedin` and `github` with a group unless a reviewed, backup-first migration copies every existing value.
- Never run `payload:seed-projects`, `payload:sync-posts`, `payload:sync-series`, repair scripts, Payload migrations, or full rollback as part of a UI-only change.
- Before any intentional schema migration: capture and verify a database backup, record collection counts, add a forward migration and rollback plan, deploy, then verify the same counts and representative records through Payload APIs.
- A public frontend response can come from local fallback after a Payload query failure. For CMS health, inspect `/api/payload/<collection>` directly; HTTP 500 means Payload/Postgres is unhealthy even if `/api/posts` still returns fallback articles.

Publishing rule:

Only posts with `status=published` are returned to the public site. Draft posts remain available in `/admin` for authenticated users.

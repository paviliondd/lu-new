# Payload CMS Flow

Admin URL:

```text
/admin
```

Public data flow:

1. Editors create or update content in Payload collections.
2. Payload stores structured records in Postgres.
3. Uploaded images are saved through the `media` collection into `/public/uploads`.
4. Frontend pages call `getCmsPublishedPosts` and `getCmsPostBySlug`.
5. Those functions read from Payload first, map documents into the existing `Post` shape, and fall back to local MDX files when Payload is unavailable.
6. `/vi` and `/en` render the same Payload document using `titleVi/contentVi` or `titleEn/contentEn`.
7. `/api/posts/[slug]/view` increments the `views` field in Payload, with local JSON fallback for development when Postgres is not running.

Collections:

- `posts`: bilingual article body, featured image, SEO, series, tags, services, labs, and views.
- `media`: uploaded images for posts and authors.
- `authors`: author profile data and avatar.
- `series`: series metadata shown on listing pages.
- `users`: Payload admin users.

Publishing rule:

Only posts with `status=published` are returned to the public site. Draft posts remain available in `/admin` for authenticated users.

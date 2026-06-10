# Headless WordPress Roadmap Workflow

## Current State

- The local static article data was cleaned.
- Existing article content was removed from `src/app/data.ts`.
- The roadmap import produced 22 draft article metadata records from `D:/Blog_AWS/Road-map.html`.
- The HTML title claims 44 articles, but `seriesData` only contains 22 explicit article objects with titles and metadata. Missing article IDs were recorded and were not fabricated.

Generated artifacts:

- `content/roadmap-draft-posts.json`
- `content/roadmap-draft-posts.wordpress.json`
- `src/app/data.ts`

## Data Contract

Each generated post has:

- `title`
- `slug`
- `category`
- `tags`
- `status: "draft"`
- `publishDate: null`
- `publish_date: null`
- empty `content`
- empty `content_en`
- SEO shell: `seo.title`, `seo.description`, `seo.ogImage`
- topic cluster fields: `topicSlug`, `clusterSlug`, `seriesSlug`
- internal-linking hints: services and exam-domain slugs

The public frontend imports `posts`, which now contains only published posts. Draft roadmap records live in `allPosts` and `draftPosts`, so drafts are prepared but not publicly published.

## Recommended CMS

Use WordPress as a Headless CMS:

- WordPress manages drafts, editing, categories, tags, status, featured images, and SEO fields.
- The Next.js frontend stays as the presentation layer.
- Sync content through the WordPress REST API. GraphQL is also possible later with WPGraphQL, but REST is enough for the current draft import workflow.

## Import Drafts

Create a WordPress application password for the editor/admin user, then run:

```powershell
$env:WORDPRESS_URL = "https://tesst.linuxunity.com"
$env:WORDPRESS_USERNAME = "editor"
$env:WORDPRESS_APP_PASSWORD = "xxxx-xxxx-xxxx-xxxx-xxxx-xxxx"
node scripts/check-wordpress-auth.mjs
node scripts/import-roadmap-to-wordpress.mjs
```

Normal import mode is create-only. If a WordPress post with the same slug already
exists, the script skips it and does not change its status, content, excerpt,
categories, tags, author, or metadata. Destructive imports are disabled.

Dry run:

```powershell
$env:DRY_RUN = "true"
node scripts/import-roadmap-to-wordpress.mjs
```

List recent WordPress drafts:

```powershell
$env:WORDPRESS_URL = "https://tesst.linuxunity.com"
$env:WORDPRESS_USERNAME = "editor"
$env:WORDPRESS_APP_PASSWORD = "xxxx-xxxx-xxxx-xxxx-xxxx-xxxx"
npm run wp:check-auth
npm run wp:list-drafts
```

Run a read-only audit before and after imports:

```powershell
npm run wp:audit
```

## Frontend Sync

Set one of these environment variables for the frontend fetch helper:

```powershell
$env:WORDPRESS_API_BASE = "https://tesst.linuxunity.com?rest_route=/wp/v2"
```

or:

```powershell
$env:NEXT_PUBLIC_WORDPRESS_API_URL = "https://tesst.linuxunity.com?rest_route=/wp/v2"
```

The helper in `src/lib/cms/wordpress.ts` maps published WordPress posts back into the local `Post` shape. It supports both `/wp-json/wp/v2` and `?rest_route=/wp/v2`; if WordPress is not configured or fetch fails, it falls back to local published posts.

## Editorial Flow

Roadmap -> Draft Articles -> Edit in WordPress -> Review -> Publish -> Next.js frontend consumes published posts.

For SEO metadata, use Yoast SEO or Rank Math in WordPress. The import manifest includes SEO shells, and the frontend helper reads Yoast `yoast_head_json` when available.

# Feature Registry

## Homepage identity and footer

Status: Production

Components:

- `HeroRecentWritingSection` and the `hero-unity-lockup` styles
- `MeetTheTeamSection` and shared `AuthorAvatar`
- `Footer` and compact `NewsletterSection`
- Payload `authors` collection using the deployed flat `linkedin` and `github` fields

Requirements:

- The complete `The Unity / Journey` lockup is horizontally centered; its internal alignment stays unchanged so `Journey` still starts below the `i` in `Unity`, without changing stored CMS data.
- Explore, Learn, and Share run as a 20-second status pipeline: each node blinks for 3 seconds, turns green, and its outgoing gradient connector fills in 1 second before the next node begins. The sequence uses 11 seconds (3 + 1 + 3 + 1 + 3); all three completed green nodes pulse together for the remaining 9 seconds. Reduced-motion mode shows the completed pipeline without animation.
- Latest `View All` uses the same unboxed teal/emerald text-link treatment as Explore by series, while Author cards carry a subtle teal/emerald ambient glow consistent with Stay in the loop.
- Desktop footer columns are equal: the logo is left-aligned, Explore with Blog/Series/About is centered, and Subscribe with its email form is right-aligned.
- Team avatars request an optimized source matching their rendered size; the 88px Team avatar must not upscale a fixed 48px source.
- The Team grid uses a single left-aligned `Our crew` label with the same teal/emerald visual treatment as `COLLECTIONS`; it has no secondary title or subtitle.
- UI-only work must preserve the deployed Payload author schema and must not run data-writing commands.

Regression checks:

- Run `tests/homepage-design-regressions.test.mjs`, `tests/footer-pipeline-regressions.test.mjs`, and `tests/homepage-toc-regressions.test.mjs`.
- Verify `/api/payload/authors` directly after deployment; frontend fallback content is not proof that Payload is healthy.

## Blog Post

Status: Production

Components:

- Payload `posts` collection
- Post API
- Blog list page
- Blog detail page
- Rich text renderer

Requirement:

- Create post
- Edit post
- Publish post
- Display frontend
- Preserve legacy fallback content
- Strip untrusted layout utility classes from CMS and fallback article HTML while retaining the renderer's semantic note, topology, and code classes, so preview and published content cannot escape normal document flow.
- Give every saved Payload revision a distinct preview URL so an existing preview tab cannot reuse stale browser or Next route state while the post is being edited.
- Keep serialized article HTML inside one atomic client island instead of passing a large server-rendered React tree through the language-provider client boundary. On slow or interrupted streams, the article body must remain absent until its complete structure is ready; tables and code blocks must never appear temporarily flattened as prose.
- On wide desktop screens, center the 900px article column against the full page independently of the table of contents. Place the 260px desktop TOC in the symmetric right-side track after the article, explicitly sharing the article's first grid row so the TOC cannot reserve a blank row above the title; do not center the combined article-plus-TOC group. Keep active-link auto-scroll inside the TOC overflow container so scroll-spy updates never move the document viewport. Keep prose, headings, tables, code blocks, and other article surfaces on the same 900px measure so their left and right edges stay balanced.
- Keep the post view-count feature fully disabled: no frontend totals, tracking request, public response field, active increment path, or visible Payload Admin field. Retain the unreadable legacy Payload column only to preserve existing stored values without a destructive schema migration. Related-post rows use compact 96×64px mobile / 128×80px desktop cover thumbnails so the artwork remains recognizable without becoming a full-size card grid.
- The Blog listing keeps the user-controlled three-post carousel, without any visible `Featured` header or badge. Its three slide posts are excluded from the unfiltered grid to prevent duplication; search and filter results still show every matching published post.
- On mobile, keep code and ASCII/Mermaid topology panels inside the viewport with touch-friendly horizontal scrolling. Use a compact single-line code toolbar, retain the language label, collapse the Copy control to its icon, and reduce code/topology font size and panel padding without wrapping or changing source alignment.
- ASCII topology figures must override the generic article-figure overflow rule so the outer panel owns rounded clipping on desktop and horizontal scrolling on mobile; all border corners and preformatted characters must remain visible.

Regression check:

- Create or edit a draft post in `/admin`
- Publish it
- Open `/vi/blog/{slug}`
- Open `/en/blog/{slug}` when English fields exist
- Refresh preview and published pages and verify content remains in normal flow with no overlapping text, including content that arrived with legacy CSS classes.
- Throttle the article route and verify that the first visible article body already contains every expected table; no intermediate plain-text table state is allowed.
- Verify SEO title, code blocks, tables, notes, topology, and images.
- At a 1536px-or-wider desktop viewport, verify the 900px article body begins on the same row as the 260px right-track TOC with no TOC-height blank area above the title. Scroll through multiple headings and confirm active-link tracking may scroll only the TOC container, never pull the document viewport upward. Also verify prose, tables, and code blocks share the same 900px aligned edges, no view tracking or totals exist, and related-post thumbnails remain compact; below that breakpoint the layout collapses to one column with an inline TOC.
- At a 390px viewport, verify ordinary code, ASCII topology, and Mermaid topology stay within the page, preserve preformatted alignment, scroll horizontally by touch, and do not force document-level horizontal overflow.

## Series landing and staging preview

Status: Staging-ready

Components:

- Payload `series` status, localized introduction, learning points, and cover image
- Payload Post `chapterOrder`
- `SeriesLandingPage` shared by public and staging-preview routes
- `deploy-staging.yml`, `.env.staging.example`, and the staging runbook

Requirements:

- Public Series lists and detail routes expose only `published` Series and Posts.
- Existing Series remain published when the additive migration runs; no existing Series/Post/media values are deleted or rewritten.
- The landing page uses LinuxUnity CMS or local fallback content only; external reference-site content is never imported.
- Chapters sort by explicit `chapterOrder`, then existing title/date fallbacks.
- `/{lang}/series-preview/{seriesSlug}` is available only when `SERIES_PREVIEW_ENABLED=true`, includes draft chapters, shows a staging banner, and is `noindex, nofollow`.
- `SITE_ENVIRONMENT=staging` makes `/robots.txt` disallow the entire staging host.
- Staging uses a separate Compose project, Postgres, Redis, media volume, OAuth credentials, and backup tree; the staging workflow deploys a Git-SHA image without updating the production tag.

Regression:

- Run `tests/series-staging-regressions.test.mjs`.
- Verify a draft Series through the Payload Preview action and confirm the public route remains 404.
- Publish Posts in chapter order, publish the Series last, then verify the public chapter list and both locales.
- Follow `docs/STAGING_DEPLOYMENT.md` for DNS, TLS, secrets, health, migration-status, and rollback checks.

## Editor

Status: Production

Components:

- Payload Lexical editor (WordPress Gutenberg-like block editor)
- Upload feature
- Simplified code block with one free-text language field
- Dedicated Mermaid/ASCII topology block
- Compact note block; legacy Terminal and FileTree rendering remains read-compatible
- Frontend rich text renderer
- Code block enhancer
- Gutenberg right sidebar layout (Status, Category, Series, Tags, Featured Image, Excerpt, Author)

Requirement:

- WordPress-style Gutenberg block editing
- Floating toolbar & inline formatting (Bold, Italic, Link, Strikethrough, Underline, Subscript/Superscript, Inline Code)
- Gutenberg blocks: Paragraph, Heading, List, Checklist, Quote, Image, simplified Code block, Table, and Separator
- ASCII network topology rendering from fenced `text` code without a separate Topology block
- Right sidebar document controls
- Mandatory publish validation (Title VI, Category, and content before publishing)
- DB-safe Payload configuration (Zero Postgres schema alterations required)
- Copy code button on frontend

Regression:

- Create article in `/admin`
- Edit with Gutenberg floating toolbar and right sidebar controls
- Add heading, bold text, image, code block, note, Mermaid topology, and ASCII topology
- Publish (verifying mandatory title & category validation)
- Reload frontend
- Copy code

## CMS Media

Status: Production

Components:

- Payload `media` collection
- Persistent local `payload_media` volume
- Payload media route and generated image sizes
- Pre-deploy media archive and full-restore support

Requirement:

- Upload image
- Upload a safe SVG diagram or logo; the server sanitizes active SVG markup before persisting it and rejects a non-SVG document disguised as SVG
- Generate card, OG, and article sizes
- Normalize SEO filename
- Render images on frontend

Regression:

- Upload image with alt text
- Upload an SVG containing a harmless vector and confirm it renders; verify a test fixture containing script/event/external-reference markup is stripped before storage
- Use it as cover image
- Use it inside rich text
- Confirm media URLs render after container restart

## Categories, Tags, Series

Status: Production

Components:

- `category` field on posts
- `tags` array on posts
- Payload `series` collection
- Series list and detail pages

Requirement:

- Assign category
- Assign tags
- Assign post to series
- Display series pages and counts

Regression:

- Assign a post to a series
- Open series list
- Open series detail
- Verify post appears

## SEO Rendering

Status: Production

Components:

- Post SEO group
- `src/i18n/metadata.ts`
- Blog detail metadata
- Sitemap, robots, RSS/feed routes

Requirement:

- Render title and description
- Render Open Graph metadata
- Render article JSON-LD
- Preserve localized alternates

Regression:

- Open a post
- Inspect page metadata
- Verify canonical and alternate URLs
- Verify sitemap and feed routes respond

## Localization

Status: Production

Components:

- `src/i18n/config.ts`
- `[lang]` routes
- `LanguageProvider`

Requirement:

- Vietnamese default locale
- English locale
- Locale switching
- Fallback from English fields to Vietnamese where intended

Regression:

- Open `/`
- Open `/vi`
- Open `/en`
- Switch locale on a post

## Theme

Status: Production

Components:

- `ThemeScript`
- `ThemeToggle`
- CSS theme variables

Requirement:

- System theme
- Dark theme
- Light theme
- Persist preference

Regression:

- Toggle theme through all modes
- Refresh page
- Verify no flash or unreadable content

## Search

Status: Production

Components:

- `/api/search`
- `SearchModal`
- Search page
- `src/lib/search/posts.ts`

Requirement:

- Search localized posts
- Highlight result snippets
- Keyboard navigation in modal

Regression:

- Search for common keywords
- Open a result
- Verify locale-specific URL

## Comments

Status: Production

Components:

- Payload `comments` collection
- `/api/comments`
- `Comments` component
- Local JSON fallback

Requirement:

- Authenticated users can submit comments
- New comments are pending
- Only approved comments show publicly
- Replies preserve parent relationship where supported

Regression:

- Login
- Submit comment
- Confirm pending message
- Approve in Payload
- Refresh post and verify display

## Authentication

Status: Production

Components:

- GitHub OAuth routes
- Google OAuth routes
- Session cookie helpers
- Payload user upsert

Requirement:

- GitHub login
- Google login
- Secure signed session cookie
- Safe `returnTo` redirect

Regression:

- Login with GitHub
- Logout
- Login with Google
- Submit comment after login

## Deployment

Status: Production

Components:

- Dockerfile
- `docker-compose.yml`
- Nginx config
- GitHub Actions deploy workflow
- `scripts/deploy.sh`

Requirement:

- CI runs lint, test, build, and Docker build before deployment
- Image build/push happens only after verification
- VPS deploy starts healthy containers
- Payload migrations run on app startup
- Production Compose pulls immutable ECR SHA images and never builds VPS source
- Pre-deploy backups cover Postgres, Payload media, runtime data, and Uptime Kuma
- Image-only and full-data rollback procedures are documented and scripted

Regression:

- Run `npm run lint`
- Run `npm test`
- Run `npm run build`
- Run Docker build
- Confirm `/api/health`

## Project Portfolio

Status: Implemented (sample content remains placeholder)

Components:

- Dedicated Payload `projects` collection with typed local fallback content
- Static project list and detail routes
- Client-side category and technology filters
- Responsive alternating timeline
- Dedicated project header and subdomain metadata
- Nginx virtual host for `project.linuxunity.com`

Requirement:

- Serve the timeline at `https://project.linuxunity.com/`
- Serve bookmarkable detail pages at `/projects/{slug}`
- Keep project content ordered newest first
- Preserve semantic links, keyboard focus, reduced motion, and mobile layout
- Do not publish placeholder metrics or empty external links
- Keep project content, statuses, tags, and case-study sections isolated from blog posts

Regression:

- Open the timeline at 375px, 768px, 1024px, and 1440px
- Filter by AWS, DevOps, Kubernetes, and Terraform
- Open each card and refresh the detail URL directly
- Confirm an unknown slug returns the project 404 page
- Confirm blog desktop and mobile navigation link to the project subdomain
- Validate `/sitemap.xml`, `/robots.txt`, HTTPS redirect, and canonical tags on the project hostname
- Create and edit a project from the independent `Project Portfolio > Projects` admin menu

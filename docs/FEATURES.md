# Feature Registry

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

Regression check:

- Create or edit a draft post in `/admin`
- Publish it
- Open `/vi/blog/{slug}`
- Open `/en/blog/{slug}` when English fields exist
- Refresh page and verify content, SEO title, code blocks, and images

## Editor

Status: Production

Components:

- Payload Lexical editor (WordPress Gutenberg-like block editor)
- Upload feature
- Code block feature
- Custom terminal, note, and file tree blocks
- Frontend rich text renderer
- Code block enhancer
- Gutenberg right sidebar layout (Status, Category, Series, Tags, Featured Image, Excerpt, Author)

Requirement:

- WordPress-style Gutenberg block editing
- Floating toolbar & inline formatting (Bold, Italic, Link, Strikethrough, Underline, Subscript/Superscript, Inline Code)
- Gutenberg blocks: Paragraph, Heading, List, Checklist, Quote, Image, Code block, Table, Separator, Custom blocks (Terminal, Note, FileTree)
- Right sidebar document controls
- Mandatory publish validation (Title VI, Category, and content before publishing)
- DB-safe Payload configuration (Zero Postgres schema alterations required)
- Copy code button on frontend

Regression:

- Create article in `/admin`
- Edit with Gutenberg floating toolbar and right sidebar controls
- Add heading, bold text, image, code block, terminal block, note, and file tree
- Publish (verifying mandatory title & category validation)
- Reload frontend
- Copy code

## CMS Media

Status: Production

Components:

- Payload `media` collection
- Upload folder `public/uploads`
- Docker volume `payload_media`
- Next image remote patterns

Requirement:

- Upload image
- Generate card, OG, and article sizes
- Normalize SEO filename
- Render images on frontend

Regression:

- Upload image with alt text
- Use it as cover image
- Use it inside rich text
- Confirm URLs render after container restart

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

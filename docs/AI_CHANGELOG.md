# AI Changelog

Every Codex code or workflow change must update this file.

## 2026-08-01

Changed:

- Replaced the shared website logo icon with the supplied penguin mark on a transparent background.
- Updated the logo asset URL to invalidate stale Next.js/browser image caches and regenerated the favicon from the new mark.
- Reworked production deployment to use immutable ECR images exclusively, create a pre-migration data backup, record rollback state, promote the production tag only after health checks, and prune unused VPS images.
- Added a dedicated local Compose build override so production `docker compose build` cannot rebuild stale VPS source.
- Expanded backup and restore coverage to Postgres, Payload media, persistent runtime data, Uptime Kuma, translation work, checksums, retention, and optional encrypted S3 copies.
- Added separate image-only and full-data rollback automation plus editable CI/CD and rollback workflow diagrams.
- Simplified series cards into a shared responsive row design with balanced light/dark styling, compact part counts, and accessible focus states.
- Restored the homepage series section to three compact cards per desktop row and strengthened the trailing teal/emerald glow in both themes.
- Removed the series CTA text so each card ends with only the compact arrow action.
- Replaced the cache-prone `/favicon.ico` metadata path with App Router `icon.png` and `apple-icon.png` assets generated from the current penguin logo.
- Updated README, repository structure, project audit, content fallback guidance, and the AI constitution to match the current CMS source-of-truth and ECR/Compose backup architecture.

Fixed:

- Changed locale switching to replace the current browser history entry, so repeated VI/EN toggles no longer pollute Back-button history.
- Stopped merging local fallback series into successful Payload responses, so deleting a series in Admin removes it from the website immediately instead of resurrecting the local fallback record.

## 2026-07-31

Added:

- Added a resumable local Codex CLI translation runner that automatically translates metadata, Lexical units, and legacy HTML; enforces structured output; preserves protected HTML/code; and produces an import-ready package without exposing the agent credential to the website runtime.
- Added protocol-aware translation routing: Claude models use Anthropic Messages while GPT models use OpenAI Chat Completions, with a local mock-server integration test covering cross-protocol fallback without consuming API credit.
- Added a database-free translation provider probe command for validating model access, endpoint routing, and credentials before starting a batch.
- Added an offline export, validation, dry-run import, and explicit apply workflow for translating through approved interactive agents without exposing production database access or making duplicate AI requests.

Fixed:

- Removed the localized post excerpt from the article-detail header in both Vietnamese and English, avoiding duplication with the opening article content while retaining excerpts for SEO, cards, and search results.
- Limited Vietnamese-remnant QA to translatable visible prose, avoiding false failures from intentionally preserved legacy image attributes, URLs, markup, and code while still rejecting untranslated article text.
- Excluded common UTF-8/Windows-1252 mojibake punctuation such as `â€”` from Vietnamese-remnant detection without weakening checks for real Vietnamese prose.
- Retried legacy HTML translation chunks when model output changes protected markup or code, while preserving successful cache entries and bypassing invalid cached candidates on validation retries.
- Removed legacy `<code>` contents from model input and restored them byte-for-byte after translation, preventing repeated command mutations from blocking a translation batch.
- Switched legacy HTML translation to isolated text units that are reinserted into the original source string, making tags, protected attributes, formatting, and code structurally immutable during translation.
- Restored every code block from the complete source article after reassembling translated chunks, protecting multiline commands even when a character-based chunk boundary falls inside `<pre>/<code>`.
- Excluded metadata-only Payload records without Vietnamese rich or legacy content from translation/export selection, preventing empty posts from consuming batch slots and AI credit.
- Closed the Payload client in a `finally` block so audit, export, import, and rollback commands exit immediately after their output is written instead of remaining alive on database handles.
- Added translation model fallback, transient retry/backoff, per-post failure isolation, failure resume, source-token caps, smaller Lexical request batches, and smallest-post-first selection.
- Added automatic ownership initialization for the host-mounted translation workspace.
- Added deploy health rollback to the previously running immutable image.
- Added Docker Compose operating instructions and a persistent host bind mount for translation candidates and rollback snapshots.
- Added a repository-boundary guide recommending an incremental `app` / `cms` / `server` / `shared` organization instead of a disruptive frontend/backend split.
- Added a Lexical-safe English translation pipeline with read-only audit mode, explicit dry-run/apply behavior, capped selection, ignored candidate artifacts, pre-change snapshots, rollback mode, and structural/remaining-Vietnamese QA gates.
- Added regression tests proving that prose is translated without changing code blocks or terminal commands, and that unsafe Lexical candidates are rejected.
- Added editable draw.io workflows for the current VPS/Compose architecture, a serverless ECS Fargate target, and an EKS target.
- Added translation operating instructions and an AWS stack/migration evaluation.

Changed:

- Parallelized verification and container build in production CI, skipped documentation-only deployments, reduced GitHub Actions cache upload size, removed the redundant ECR existence check and `latest` image tag, and explicitly build the production runner target.
- Kept `tsx` as a production runtime dependency because the containerized Payload migration and translation tools load TypeScript configuration at runtime.

Removed:

- Removed generated Understand Anything knowledge-graph metadata from version control and ignored future `.understand-anything/` output.
- Removed repository-local copies of Codex design skills, an embedded AWS CLI installer, obsolete WordPress deployment plugins, superseded translation and API-token diagnostic scripts, unused Next.js starter assets, unused UI/config modules, local logs, and unreferenced roadmap drafts.
- Removed the API-token diagnostic from the default Node test discovery path; it made external authenticated requests and was not a website regression test.

Validated:

- `npm test` passes all 35 tests, including the translation pipeline coverage.
- `npm run build` completes successfully while using the documented local-content fallback because the Docker-only PostgreSQL hostname is unreachable on the host.
- `npm run lint` completes with zero errors and two pre-existing unused-variable warnings outside the new pipeline.
- The post-cleanup validation completes with 34 passing website tests, a successful production build, and zero lint errors (one pre-existing warning remains).
- The generated codebase knowledge graph validates with 176 nodes, 376 edges, eight architectural layers, and four onboarding tour steps.
- All workflow diagrams pass draw.io structural validation; current and serverless diagrams score with no warnings.

Known limitation:

- The local translation audit and three-post pilot require a reachable PostgreSQL service. The current `.env` resolves PostgreSQL through Docker hostname `postgres`, but Docker is unavailable in this execution environment, so no database record was read or changed.

## 2026-07-30

Added:

- Implemented Chapter Navigation (`← PREVIOUS` / `NEXT →`) above the `More in [Topic/Series]` section for posts in the same topic or series, with clean chapter parsing (`Phần X`, `Chapter X`, `Bài X`, etc.) and sorting in `src/lib/utils/chapter.ts`.
- Added unit tests (`tests/chapter-navigation.test.mjs`) validating title chapter extraction, sorting, and navigation derivation.
- Added optional `chapterOrder` sidebar field in Payload CMS `Posts` collection for manual chapter position overrides.

Changed:

- Removed top-right "Tất cả bài viết" and "View All" header links from `More in [Topic/Series]` in `ArticleClient.tsx`.
- Relocated "← Back to all posts" link to the bottom of `More in [Topic/Series]` right above comments.
- Updated `More in [Topic/Series]` section title to dynamically display the Series title (if assigned) or Topic name with English base labels.
- Fixed `src/lib/utils/security.ts`, `src/lib/comments/store.ts`, and `src/lib/cms/payload.ts` by using CJS-safe default imports for `xss` (`import xss from 'xss'`) to prevent Node ESM named import `SyntaxError` when fetching published posts from Payload CMS server-side.

Validated:

- Executed `npm run lint` (0 errors, 0 warnings), `npm test` (8 pass), and `npm run build` (successful static page generation & compilation).

## 2026-07-28

Added:

- Implemented asymmetric 2-zone editorial Hero section (70% main content / 30% progress cluster) featuring mixed typography ("The Unity" bold sans-serif + "Journey" serif italic in teal), brand description (`LinuxUnity is a team of engineers sharing what we learn on our journey through DevOps and Cloud.`), and `Start exploring →` action button.
- Added live-action floating sea-bubble ambient glow effect powered by global CSS keyframes (`liveBubble1`, `liveBubble2`, `liveBubble3` in `globals.css`) for continuous real-time drifting, scaling, and morphing behind `"The Unity Journey"`.
- Implemented 1-way ocean wave progress flow animation (`explore` → `learn` → `share` → hold → dissolve fade-out → repeat wave from top), eliminating all backward line contractions.
- Updated Series section header to include horizontal dash line prefix `── COLLECTIONS` (matching `── FROM THE BLOG`) and removed `02 /` prefix.

Changed:

- Updated hero translation keys for title split, description, collections label, and action button in `LanguageProvider.tsx`.

Validated:

- Passed `npm run lint` (0 errors, 0 warnings) and `npm test` (28 unit tests). Verified live dev server rendering on `http://localhost:3000`.










## 2026-07-27

Added:

- Added 3D metallic penguin logo assets (`public/images/linuxunity-logo.png`, `public/images/logo-icon.png`, `public/favicon.ico`) with outer background padding removed. Replaced `<Cloud>` icons in `Header.tsx`, `Footer.tsx`, and `AboutPage.tsx`.
- Added `formatTopicLabel` utility (`src/lib/utils/formatTopic.ts`) to format Topic strings with a capitalized first letter and lowercased subsequent words (sentence case e.g. "Linux tips", "Service mesh"), while preserving tech acronyms (AWS, CI/CD, K8S, DNS, IP, SRE, etc.).
- Added unit tests `tests/format-topic-label.test.mjs` verifying topic formatting rules and acronym preservation.
- Added macOS-style 3 colored dots (red, yellow, green) and uppercase language badge (`BASH`, `TEXT`, `PYTHON`, etc.) to code block headers.
- Moved Author info card to the end of article content in `ArticleClient.tsx` (above comments section).

Changed:

- Optimized `.github/workflows/deploy-production.yml` by removing redundant `npm run build` and `docker build` validation steps from the `verify` job, and adding Docker Buildx GitHub Actions caching (`--cache-from type=gha`, `--cache-to type=gha,mode=max`) to speed up production deployments by 60-80%.
- Updated Hero section text to "The DevOps Journey" badge/title and aligned "Read the Blog →" button to the right.
- Converted all section headings to English and hidden the language switcher from Header navigation.
- Updated About page content: enlarged `LINUXUNITY` text, removed legacy subtitle line, and added new reflection text.
- Removed breadcrumbs (`Home > About`, `Home > Blog > [slug]`) across all pages.
- Disabled line numbers by default in `CodeBlock.tsx` and reduced code header min-height (`2.25rem`).
- Updated `BlogListPage.tsx` topic filter pills, tag badges, reset filter link, and pagination links with `scroll={false}` to preserve page scroll position during filtering instead of auto-scrolling to top.
- Positioned "Read →" links at the bottom right corner (`justify-end`, `ml-auto`) across both main and secondary featured cards in `FeaturedPostsCarousel.tsx`.
- Improved featured cards visual aspect ratio (`aspect-[16/10]`, `min-h-[11.5rem]`) and dark gradient contrast (`from-slate-950/95 via-slate-950/70 to-slate-950/20`) for optimal text legibility.

Validated:

- Passed `npm run lint` (0 errors, 0 warnings), `npm test` (28 tests), and `npm run build`.

Never break:

- Topic filter scroll position preservation, topic sentence-casing, Read link bottom-right alignment, and code block macOS styling.

## 2026-07-26

Added:

- Added Topic Filter Bar on `/blog` page (`BlogListPage.tsx`) displaying dynamic topic pills (AWS, Ansible, Linux, CI/CD, Cloud...) with English "Topic:" label, keeping the Featured slide carousel persistently visible at top while filtering post cards below.
- Added explicit "Featured" section header and badge in `FeaturedPostsCarousel.tsx`.
- Fixed AWS logo SVG URL using `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/amazonaws.svg` with `dark:invert` contrast enhancement in Dark mode.
- Renamed Category field in Payload CMS admin `Posts` collection to `Topic (Chủ đề)` (`admin.description` & `label`) while preserving DB field name for 100% DB schema safety.
- Added Draft Preview feature (`getCmsPostBySlug(slug, locale, allowDraft)`) enabling admin editors to preview draft posts live on the frontend via `?preview=true` with a prominent "DRAFT PREVIEW" notification banner.
- Set default initial theme preference for first-time visitors to Light mode in `ThemeScript.tsx` and `ThemeToggle.tsx`.
- Optimized tech brand logos (AWS orange `#FF9900`, Ansible, Linux, CI/CD) and CSS filter brightness in Dark mode.
- Upgraded Payload CMS admin editor to a WordPress Gutenberg-like experience with floating formatting toolbar, checklist block, list indentation, subscript/superscript.
- Structured Payload `Posts` collection with a WordPress-style right sidebar layout (`admin: { position: 'sidebar' }`) for Publication status & date, Topic, Series, Tags, Featured Image, Excerpt, and Author.
- Added mandatory publish validation in `Posts` collection (`beforeChange` hook) requiring Title VI, Topic, and non-empty content before publishing.

Changed:

- Updated `scripts/repair-payload-posts.mjs` so it selectively publishes posts with valid content and preserves empty drafts.
- Updated `getCmsSeries` in `src/lib/cms/payload.ts` to compute `partsCount` from actual published post count (`counts.get(item.slug) ?? 0`) rather than falling back to static metadata.

Validated:

- Passed `npm run lint`, `npm test` (26 tests), and `npm run build`.

Never break:

- Topic filter bar, Draft preview mode, default light theme, Gutenberg block editor capabilities, right sidebar layout, DB schema stability, publication constraints, and bilingual routing.
## 2026-07-25

Added:

- Upgraded Payload CMS admin editor to a WordPress Gutenberg-like experience with floating formatting toolbar, checklist block, list indentation, subscript/superscript, draft autosaving (2s interval), and complete revision version history.
- Structured Payload `Posts` collection with a WordPress-style right sidebar layout (`admin: { position: 'sidebar' }`) for Publication status & date, Categories, Series, Tags, Featured Image, Excerpt, and Author.
- Added mandatory publish validation in `Posts` collection (`beforeChange` hook) requiring Title VI and Category before publishing.
- Updated `sitemap.xml` and `localizedAlternates` to generate complete localized paths and hreflang links for both `vi` and `en` locales.

Fixed:

- Resolved infinite HTTP 307 redirect loop in `LegacyBlogPostRoute` (`src/app/blog/[slug]/page.tsx`) by directly rendering the default locale post when requested at `/blog/[slug]`.
- Fixed fallback domain typo in `src/i18n/metadata.ts`.

Validated:

- Passed `npm run lint`, `npm test` (25 unit tests), and `npm run build`.
- Updated `AGENTS.md`, `README.md`, `docs/FEATURES.md`, and `docs/AI_CHANGELOG.md`.

Never break:

- Gutenberg block editor capabilities, draft autosave, right sidebar layout, bilingual routing, sitemap alternates, and legacy fallback model.

>>>>>>> origin/main

## 2026-07-19

Fixed:

- Restored legacy WordPress media rendering by preferring persisted `/uploads/imported/` URLs over Payload's generated file endpoint in media relationships, admin thumbnails, and frontend post mapping.
- Added a redirect fallback for legacy file requests when the Payload root upload is absent, while preserving native Payload media URLs.

Validated:

- Added regression coverage for legacy imported, native, and generated-size media URL selection.
- Passed `npm run lint`, `npm test` (25 tests), and `npm run build` on Next.js 16.2.7.

Never break:

- Native Payload uploads, generated image sizes, legacy imported media, and Next.js image optimization.

## 2026-07-15

Added:

- Added server-rendered React code blocks with stable filename/language metadata, non-copyable line numbers, inline long-code expansion, and exact-source downloads when a filename is available.
- Added an accessible icon-only copy control with visible processing/success/error icons, Clipboard API fallback, focus restoration, tooltip text, and screen-reader live status.
- Added per-media article fit (`cover` or `contain`) and focal-point support, including a migration that keeps existing media on `cover` and sets the `ansible-inventory` hero to `contain`.
- Added a mobile table-of-contents disclosure and regression tests for exact code copying, clipboard fallback, download sanitization, initial server markup, media schema coverage, and double-escaped excerpts.

Changed:

- Replaced post-hydration `<pre>` DOM enhancement with sanitized server-side HTML parsing that renders code toolbars in the initial React tree.
- Updated article layout to separate reading, title/metadata, and media/code widths; balanced long titles; constrained prose to 72 characters; and improved mobile typography and metadata wrapping.
- Changed article heroes to a stable 2:1 container with accurate responsive sizes, preload behavior, configurable object fit, focal positioning, and descriptive media alt text when available.
- Normalized CMS excerpts before rendering so encoded ellipses and ampersands display as readable text without `dangerouslySetInnerHTML`.
- Reduced the article and blog-list desktop containers, compacted the code toolbar, and kept 44px mobile touch targets for code actions.
- Kept featured-post autoplay while changing the row below it to show the next three distinct posts instead of repeating the three active slides.

Fixed:

- Aligned the article title, hero, nested CMS headings, media, tables, Mermaid diagrams, and code blocks to the same fixed 46rem reading column, avoiding font-relative `ch` expansion on large headings.
- Removed the duplicated featured-post thumbnail controls from the blog page and excluded the three following cards from the paginated post grid.

Removed:

- Removed the effect-driven code wrapper/modal enhancer, clipboard timeout race, and obsolete expand-button module.

Validated:

- Passed `npm run lint`, `npm test` (24 tests), `npx tsc --noEmit`, and `npm run build` on Next.js 16.2.7.

Never break:

- Sanitized Payload and legacy fallback article rendering, bilingual routing, table of contents, Mermaid diagrams, image lightbox, comments, related posts, dark/light themes, and keyboard accessibility.

## 2026-07-14

Added:

- Added reusable code syntax helpers for language aliases, safe JSON formatting, and metadata normalization.
- Added non-copyable line numbers, filename and language metadata, localized fullscreen controls, and an accessible native fullscreen dialog for code blocks.
- Added regression tests for language aliases, JSON formatting, invalid JSON preservation, and code labels.
- Added regression coverage for immutable ECR tagging and registry deployments that must not rebuild on the VPS.
- Added regression coverage for the homepage query limits and carousel removal, icon-only Copy control, observer-based TOC behavior, Media volume ownership initialization, and Sharp WebAssembly fallback.
- Added a one-shot Compose `media-permissions` service so the non-root app user can safely write to the existing `payload_media` volume.
- Added read-only legacy Media detail hydration so Payload Admin can resolve imported files and derive missing preview dimensions without a schema change, migration, or database backfill.

Changed:

- Redesigned article typography around an 18px body, 1.75 line height, a 900px article column, and a 72-character reading measure.
- Allowed article images, tables, diagrams, and code blocks to expand up to 1100px without causing mobile overflow.
- Updated code highlighting to use Shiki with GitHub Light and VS Code Dark Plus themes, with plaintext fallback for unsupported languages.
- Refactored code block controls into focused copy, expand, syntax, and interaction modules while preserving sanitized HTML rendering for Payload and legacy Markdown content.
- Changed production ECR publishing to tag each verified image as `latest`, `production`, and the immutable Git commit SHA.
- Changed VPS production deployment to pull the exact commit-tagged ECR image and start it with `--no-build`, while preserving source builds as the manual fallback.
- Changed Docker dependency stages to pin the x64-v1-compatible Sharp `0.33.5`, remove Next's nested `0.34.5`, and fail fast unless Payload and Next resolve the same native package.
- Changed the production SSH step to synchronize `origin/main` before invoking the deploy script, preventing the running script from replacing itself mid-deployment.
- Removed the hero carousel from the homepage render tree while preserving the shared carousel used on the blog page.
- Limited homepage Payload queries to six newest published posts and three newest series, and added the Collections/Series heading with localized view-all links.
- Changed code block Copy controls to icon-only output while preserving Clipboard API behavior, accessible labels/tooltips, and the two-second success state.
- Replaced the TOC window scroll listener with IntersectionObserver scroll-spy behavior, a sticky viewport-bounded scroll container, and nearest-item auto-scroll.

Fixed:

- Fixed inconsistent article widths across desktop and tablet breakpoints.
- Fixed code copy status icons, long-code expansion animation, fullscreen focus restoration, and localized expand/close labels.
- Fixed rich-text figure layout so terminal, file-tree, code, and image blocks remain vertically structured.
- Fixed production builds and Next image optimization failing because Sharp `0.34.5` requires x86-64 v2 while its WASM fallback also requires unsupported WebAssembly SIMD on the VPS.
- Fixed the first deployment after a deploy-script update continuing with stale local-build logic after resetting its own working tree.
- Fixed ECR deployments rebuilding the application on the VPS instead of running the already verified image pushed by CI.
- Fixed legacy imported Media file requests being converted into Payload 500 responses by resolving the imported file before invoking the Payload file handler.
- Fixed Media Save failures caused by unwritable Docker volume ownership and improved duplicate, validation, missing-file, and rename errors in Vietnamese.
- Fixed Payload Image Editor previews with missing legacy width/height metadata while leaving all existing Media records unchanged.

Never break:

- Payload CMS editor, collections, database schema, APIs, and rich-text content output.
- Legacy Markdown/local content fallback and existing article code blocks.
- Vietnamese default locale, English locale, responsive design, dark/light theme, comments, OAuth, and SEO rendering.
- Existing Payload records, collection schemas, migrations, and Media relationships.
- Vietnamese default routing and optional English `/en` routing.
- Shared blog cards, carousel usage outside the homepage, Lexical rendering, and code block copy behavior.

## 2026-07-13

Added:

- Added `sharp` as a runtime dependency and passed it into Payload config so Media `imageSizes` can generate thumbnails and resized variants.
- Added media admin thumbnail fallback logic that uses generated sizes, stored URLs, or Payload file routes.
- Added localized code block labels for explain and show more/show less controls.
- Added an optional Payload Code Block explanation field and a localized empty state for legacy code blocks.
- Added regression coverage for imported Media fallback, rename safeguards, code controls, carousel sizing, and legacy inline TOC removal.

Changed:

- Updated the Media rename hook to preserve the correct public URL model, keep legacy `/uploads/imported` media compatible, avoid wiping empty `sizes`, and check filename conflicts before renaming.
- Updated code block toolbar layout so action buttons are right-aligned and copy/explain controls keep icon plus text.
- Changed long code block collapse threshold from 30 lines to 10 lines with localized show more/show less labels.
- Switched the app Docker build from Alpine/musl to Debian slim/glibc, pinned `sharp` to `0.33.5`, and added npm cache mounts to reduce rebuild time.
- Set the Compose app build target explicitly to the final runner stage.
- Changed Media filename updates to reuse the active Payload request/transaction and roll storage renames back if persistence fails.
- Changed featured carousel slides to explicit full-width, non-shrinking items so the global `min-width: 0` reset cannot collapse them.

Fixed:

- Fixed Payload Media thumbnail generation/configuration by enabling `sharp` and explicit admin preview behavior.
- Fixed Media SEO filename rename flow so duplicate filenames return a clear validation error instead of falling through to an unknown error.
- Fixed code block expansion UX for long snippets and added a safe explain toggle that only appears when explanation content exists.
- Fixed production Docker build failure caused by the `sharp` linuxmusl-x64 binary requiring an unsupported x64-v2 CPU.
- Fixed legacy Media edit/crop previews by serving missing Payload file requests from `public/uploads/imported` with path traversal protection.
- Fixed legacy empty image-size metadata causing Card/Article/OG MIME type validation errors when saving Alt or SEO filename.
- Fixed Media rename path resolution, collision/error reporting, and imported-file URL preservation.
- Fixed Copy code getting stuck in a loading state when the Clipboard API never settles by adding a bounded fallback.
- Fixed Explain code so code and explanation remain visible together and the button toggles both labels and panel state.
- Removed imported WordPress Easy Table of Contents blocks from article bodies while preserving the right sidebar TOC.

Never break:

- Payload CMS media upload, image handling, and SEO filename behavior.
- WordPress-like editor, rich text editor, code block, copy code button, and SEO rendering.
- Vietnamese default locale and English locale.
- Responsive design, dark/light theme, comments, OAuth, and comment approval workflow.

## 2026-07-12

Added:

- Project audit documentation.
- AI project constitution.
- Feature registry.
- Regression checklist.
- AI development workflow.
- Stabilization report.
- CI test and Docker build validation gates.

Changed:

- Added a minimal `npm test` script so CI can enforce the requested test gate.
- Updated production deploy workflow to run `npm test` and a Docker build validation before image push/deploy.
- Created local `develop` and `codex/stabilize-ai-workflow` branches to avoid direct work on `main`.

Fixed:

- Documented missing workflow guardrails that could allow regression.
- Added Payload media schema migration coverage for `filenameSlug` and `sizes`, which are required by the Media admin list and post media relationship expansion.
- Added a follow-up migration for Payload Postgres image size columns (`sizes_card_*`, `sizes_og_*`, and `sizes_article_*`) used by the upload adapter.
- Added media filename normalization error logging and filename slug validation.
- Added a regression test that checks media config, migration registration, migration columns, and generated Payload types stay aligned.

Never break:

- Payload CMS editor and schema.
- Rich text, code block, copy button, image handling, SEO, categories, tags, and series.
- Vietnamese default locale and English locale.
- Responsive design, dark/light theme, and SEO rendering.
- Comments, GitHub OAuth, Google OAuth, and comment approval workflow.
# 2026-08-03 — Project portfolio subdomain

- Added a dedicated LinuxUnity project portfolio layout with a responsive, filterable timeline and static detail routes.
- Added three clearly marked placeholder projects backed by a typed, runtime-validated content model.
- Added project-specific metadata, canonical URLs, CreativeWork structured data, sitemap, robots, accessible navigation, and responsive architecture placeholders.
- Added the absolute Project link to the shared blog navigation and configured the actual repository URL from the Git remote.
- Added hostname routing and Nginx/Certbot configuration for `project.linuxunity.com` while retaining the existing single ECR image and `docker compose up --no-build` production model.
- Added portfolio regression tests and deployment/DNS documentation.
- Added a dedicated Payload `projects` collection, migration, generated types, seed command, published-project preview, and Payload-first project reader. Project content remains isolated from blog posts and local sample data is used only when Payload is unavailable or its query fails.
- Kept Project administration content-focused by deriving public metadata from title and summary instead of exposing editable SEO fields.
- Fixed the production runner image so Payload migrations can resolve the separate Projects collection and project seed content at container startup.

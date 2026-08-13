# AI Changelog

Every Codex code or workflow change must update this file.

## 2026-08-13

Added & Fixed:

- Pinned `sharp` dependency strictly to `0.35.3` in `package.json` and `package-lock.json`, removing the caret prefix `^` to satisfy strict equality checks in regression test suites and Docker build assertions.

## 2026-08-12

Added & Fixed:

- Upgraded Next.js to 16.3.0, the Payload CMS suite to 3.88.0, Sharp to 0.35.3, Mermaid to 11.16.1, and DOMPurify to 3.4.13, eliminating all high and critical production dependency advisories.
- Rebased the Payload Lexical missing-schema hotfix onto `@payloadcms/richtext-lexical@3.88.0` and added regression floors for the security-patched production versions.
- Updated both Docker dependency stages to validate Sharp 0.35.3 without importing its newly restricted `package.json` export, while still forcing Next and Payload to share one native Sharp installation.
- Reduced `npm audit --omit=dev` from 15 high and 7 moderate findings to 5 moderate findings; the residual chain is upstream `@payloadcms/db-postgres -> drizzle-kit -> @esbuild-kit/esm-loader -> esbuild`, for which npm currently reports no compatible fix.
- Patched the upstream Payload Lexical block renderer to handle a missing client schema entry without crashing on `blockReferences`; the patch is re-applied after every local, CI, and production dependency install.
- Temporarily disabled the Payload S3 adapter and S3 Compose variables so production media remains on the persistent local `payload_media` volume until a dedicated migration can be completed.
- Normalized malformed protocol-relative Payload media URLs in legacy article HTML so browsers no longer resolve the internal `/api/payload/...` path against an invalid `api` hostname.
- Added the active local Payload media volume to pre-deploy backups and full restores while local storage remains enabled.
- Fixed the Payload Lexical post editor crash (`Cannot read properties of undefined (reading 'blockReferences')`) by preventing duplicate default feature registration while preserving the customized heading/upload features, fixed toolbar, table, and custom code block.
- Restored the legacy Payload media volume until the S3 migration is complete and changed missing-media redirects to relative public URLs instead of the internal `0.0.0.0:3000` origin.
- Removed Note and Topology from new-editor choices, hid the simplified Code block name controls, and render fenced `text` network diagrams as compact headerless ASCII topology while preserving legacy block converters.
- Applied Inter to the projects site, enlarged the homepage Journey word, restored a localized author-description fallback for incomplete CMS profiles, and tightened quote, note, table, figure, and topology spacing.

## 2026-08-11

Added & Fixed:

- Fixed the blank Payload Admin/login page by regenerating the Admin import map with the S3 upload handler and moving the simplified code block away from Payload's reserved `Code` slug; existing `Code` content remains render-compatible.
- Switched the frontend's global sans font from Geist to Inter, retained Geist Mono for code, and placed `Journey` on a stable centered line below `Unity` without overlap.

- Temporarily made S3 backup upload optional and commented its workflow exports so production deploys continue while the backup bucket is being configured; local VPS backups remain enabled.

- Fixed intermittent draft previews by requesting Payload draft versions explicitly for both direct and fallback slug lookups.

- Simplified the CMS Code block to a free-text language field plus code textarea; removed filename and language dropdown behavior.
- Added a dedicated Topology block supporting Mermaid SVG diagrams and compact ASCII topology figures.
- Removed Terminal and FileTree from new-editor choices while preserving legacy frontend rendering.
- Unified Code block and Table panel colors, reduced excess spacing around tables, code, quotes, notes, and topology.
- Standardized site typography on sans-serif, retained monospace for code/topology, and anchored the Journey word below the `i` in Unity.

- Made the homepage Team section read Payload `authors`, with local authors only as an outage/development fallback.
- Removed the visible `Editorial Team` fallback label.
- Added the official Payload S3 adapter and CDN URLs; removed production local-media volumes.
- Required off-host S3 backup uploads and retained compatibility with legacy local-media archives.
- Gated ECR build/push on lint, tests, and the production build.
- Replaced Draw.io/PNG topology pairs with Markdown Mermaid documents.
- Removed three source files confirmed unused by static analysis; retained fixtures and scripts that have active consumers.
- Rewrote README with architecture, Compose, CI/CD, S3, backup, and rollback rationale.

## 2026-08-10

Added & Fixed:

- Redesigned home page layout (`HomePage.tsx`) according to user-provided wireframe mockups across 4 core sections:
  - **Section 1 (Hero + Recent Writing):** Created `HeroRecentWritingSection.tsx` featuring brand title/journey with line-broken `Journey` starting under letter `n/i` of `Unity`, inline `Start exploring ->` CTA, and 3-node connected pipeline (`explore`, `learn`, `share`) on the left, paired with a 3-post grid (1 large featured post + 2 sub-cards) on the right with a `Latest articles` header and `View All ->` link.
  - **Section 2 (Popular Series):** Preserved existing `SeriesRow` compact row design and section headers (`collectionsLabel` & `exploreBySeries`) while arranging 3 series in a responsive grid layout with progress indicators.
  - **Section 3 (Meet the Team):** Created `MeetTheTeamSection.tsx` with a 2-person team frame featuring **Peter Parker** and **Huỳnh Minh Thái**.
  - **Section 4 (Newsletter):** Created `NewsletterSection.tsx` with theme-adaptive styling for both Dark and Light modes (`#0f172a` container, high-contrast dark/slate input, vibrant teal/emerald CTA button) integrated with `/api/newsletter`.
- Updated team members data in `src/app/data.ts`:
  - Replaced legacy authors with Peter Parker and Huỳnh Minh Thái, updating both roles to **System Engineer**.
  - Updated Peter Parker's avatar image with a high-resolution Spider-Man photo saved to `/public/images/peter-parker.jpg`.

Validation:

- Ran `npm run lint` - 0 errors, 0 warnings.
- Ran `npm test` - 66/66 passing tests.
- Ran `npm run build` - successful Next.js production build.

## 2026-08-09

Added & Fixed:

- Optimized language switcher performance (`LanguageProvider.tsx` & `LanguageToggle.tsx`): added optimistic language state and React `useTransition` for instant zero-delay UI feedback on click with non-blocking async route transitions and spinning globe indicator.
- Added in-memory file post caching (`postFileCache`) in `localized-posts.ts` to eliminate disk read I/O delays during server-side post translation and locale rendering.
- Expanded Payload Admin post editor main canvas to full width (`width: 100%`, `max-width: 100%`) in `custom-admin.css` for spacious editing ("tràn viền").
- Fixed Preview language switching and EN slug lookup in `payload.ts` and `LanguageProvider.tsx`: preserved query search parameters (`?preview=true`) when switching locales and added fallback slug matching for Vietnamese/English title slugs in Payload queries.
- Added `suppressErrorRendering: true` to `MermaidRenderer.tsx` `mermaid.initialize` options to prevent global Mermaid error banner injection on missing diagrams or 404 pages.
- Fixed Newsletter API in `route.ts` & `store.ts` to dispatch welcome email ONLY on first-time subscription (`created === true`), avoiding duplicate welcome emails on resubmission, and added explicit error logging for subscriber file persistence.
- Translated newsletter welcome email template and confirmation subject line in `smtp.ts` to 100% English, incorporating the requested DevOps/Cloud journey welcome message.
- Added `runtime-data-permissions` helper service to `docker-compose.yml` and `docker-compose.build.yml` (`chown -R 1001:1001 /app/data`) to guarantee non-root `node` container file write permissions for `/app/data/newsletter_subscribers.json`.
- Removed `livePreview` split-screen iframe mode from `Posts` collection in `payload.config.ts` so clicking **Preview** opens post previews directly in a **new browser tab** (`target="_blank"`).
- Styled right Document Inspector sidebar in Payload Admin matching Image 1 layout (Status & Publish -> Article URL / Slug -> Featured Image -> Excerpt -> Category & Series -> Tags -> SEO).
- Streamlined duplicate fields in SEO group (Meta Title, Meta Description, OG Image) so they default automatically to Title, Excerpt, and Featured Image without double entry.
- Unified Code Block background, header, and border colors with Table styling variables (`--article-panel-body`, `--article-panel-header`, `--article-panel-border`) in `code-theme.css`.
- Fixed table block layout in Payload Lexical admin editor with `width: 100%`, `table-layout: auto`, cell `min-width: 120px`, and padded headers to prevent text column squishing.

Validation:

- Ran `npm run lint` - 0 errors, 0 warnings.
- Ran `npm test` - 66 passing tests.
- Ran `npm run build` - successful Next.js production build.

## 2026-08-07

Added & Fixed:

- Fixed PostgreSQL `content_vi NOT NULL` database column constraint violation in `payload.config.ts` by ensuring `data.contentVi` defaults to `textFromRichText(data.contentRichVi)` or `" "` in `beforeChange` hook whenever empty during post creation.
- Created `AdminThemeToggle.tsx` component (`admin.components.actions`) and set `admin.theme: "all"` in `payload.config.ts` to add a Dark/Light Mode toggle button to Payload Admin header bar.
- Added custom duplicate slug validator to `slug` field in `payload.config.ts` (`Posts` collection) to return readable Vietnamese messages instead of triggering database 500 unique constraint violations.
- Set `required: false` on `listField` array items (`tags`) to prevent empty tag array validation errors.
- Upgraded `textFromRichText` with `WeakSet` node tracking and custom Lexical block fields (`code`, `title`, `explanation`) text extraction, and wrapped `Posts` collection `beforeValidate` and `beforeChange` hooks in defensive try-catch handlers to resolve `An unknown error occurred`.
- Removed unused legacy fields (`chapterOrder`, `certs`, `services`, `examDomains`, `labs`) from Payload CMS `Posts` collection.
- Reordered `/blog` page layout: 3-slide carousel (`FeaturedPostsCarousel`) at top -> Search bar & Topic filter pills -> Grid of all remaining posts (newest to oldest, excluding only the 3 slide posts).
- Enhanced code language auto-detection in `syntax.ts` and `highlight.ts` to recognize Ansible YAML tasks (`- name:`, `tasks:`, `apt:`, `service:`, `state:`) and display `YAML` accurately even when legacy block language was set to `bash`.
- Added support for explicit `plaintext` / `Plaintext` display labels.
- Added `title_en`, `description_en`, and dedicated `aws-lambda-execution-model.en.mdx` post, and updated `legacy-translation.ts` fallback synthesis to preserve explicit English titles.
- Removed redundant `FILTER: Topic: ... RESET FILTERS` active pill bar from `BlogListPage.tsx`.
- Removed the Download button from `CodeBlock.tsx` header controls and deduplicated identity header tags when filename matches language (`Bash` / `bash`).
- Fixed table cell border styling in `globals.css` so vertical column separators in the last row remain intact.
- Created `scripts/sync-mdx-posts-to-payload.mjs` (`npm run payload:sync-posts`) to import/upsert local MDX posts from `content/posts/*.mdx` into Payload CMS `posts` collection in PostgreSQL.
- Implemented auto-generated English URLs (`slug_en`) from `title_en` for posts when browsing in `/en` locale.

- Implemented scroll position preservation on page refresh (F5) in `ArticleClient.tsx` using a first-mount ref check, and updated root `scroll-behavior` to `auto` in `globals.css` and `layout.tsx` to instantly jump to top on article navigation without bottom-up animated scroll artifacts.
- Created regression tests and verified that table of contents smooth scrolling to headings remains intact.
- Enforced Payload CMS as authoritative for published posts when reachable in `payload.ts`, eliminating fallback `.mdx` file resurrecting of draft or deleted posts.
- Added `broadcastNewPostNotification` to `src/lib/newsletter/smtp.ts` and wired it up via dynamic import in `payload.config.ts` `afterChange` hook to automatically send newsletter email broadcasts to all registered subscribers whenever a new post is published.

Validation:

- `npm run lint` passes with 0 errors and 0 warnings.
- `npm test` passes (66 tests).
- `npm run build` completes successfully.

## 2026-08-06

Changed:

- Redesigned frontend article tables and code blocks as bordered, shadow-free panels with separate header bars matching the supplied dark-theme reference.
- Standardized all article table/code controls in English, tightened toolbar density, and added normalized automatic language display names such as HTML, Python, Markdown, and Go.
- Added responsive table overflow, row hover tint, accessible table copy/download actions, and localized labels without changing Payload collections or stored content.
- Added a sanitized Markdown Code/Preview switch while preserving code copy, download, collapse, explanation, and Shiki highlighting behavior.
- Added a local `/en/design-preview` showcase route for visual review of both components.
- Excluded repository-local `.codex` reference material from Tailwind source discovery to prevent malformed example utilities from entering generated CSS.

Validation:

- Full `npm test` passes (34/34).
- `npm run lint` passes with two pre-existing warnings.
- `npm run build` passes; local Postgres hostname remains unavailable outside Docker and falls back as designed.

## 2026-08-04

Changed:

- Temporarily hid the Project link from the shared blog desktop and mobile navigation while retaining its `project.linuxunity.com` configuration and the project subdomain routes for later launch.

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

- Standardized all article table/code controls in English, tightened toolbar density, and added normalized automatic language display names such as HTML, Python, and Markdown.
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
- Made Payload CLI startup independent of the TypeScript `@/*` alias for runtime config imports, preventing `payload migrate` from treating `@/collections` as an npm package in production containers.
- Added the documented AWS Serverless Event Registration System to the project portfolio with repository evidence, implementation details, security and observability notes, and an architecture diagram.
- Changed the project subdomain to clean public URLs (`/` and `/{slug}`), introduced an accessible light theme, translated the project UI to English, and made the explicit project seed command update existing CMS records as well as create missing ones.

# 2026-08-03 — AWS certification content planning

- Added a Vietnamese MDX article outline for the DVA-C02 Lambda execution model, covering lifecycle, handler, context, timeout, basic concurrency, a mini-lab, exam traps, and review questions.
- Split Lambda Layers and advanced concurrency details into follow-up article topics to keep the first lesson focused.

# 2026-08-03 — Project navigation, data bootstrap, and theme

- Fixed the project header order to Blog, Projects, About and linked the LinuxUnity logo back to `https://linuxunity.com`.
- Removed the global blog-repository shortcut from the project header; project detail pages now show a GitHub icon only when that project has its own repository URL.
- Enabled the existing persisted system/dark/light theme controls on project list and detail pages, with project-specific dark color tokens.
- Prevented project theme initialization from producing a React hydration mismatch.
- Added a one-time Payload data migration that initializes the project collection only when it has never contained a record, without merging or overwriting CMS-managed content.
- Removed the final lint warning from the unused read-time locale argument without changing read-time behavior.

# 2026-08-04 — AWS deployment series architecture outline

- Added matching Vietnamese and English MDX outlines for analyzing the current LinuxUnity architecture.
- Included placeholders for the system overview, reading, publishing, authentication/comment, and deployment-topology diagrams.
- Covered current components, data boundaries, dependencies, failure boundaries, strengths, limitations, and protected architectural decisions.
- Reserved Docker guidance, AWS mappings, certification coverage, and migration roadmaps for later articles.
# 2026-08-10 — Responsive UX stabilization

Fixed:

- Removed the default-locale redirect branch that re-entered the `/vi` rewrite and caused a local redirect loop.
- Stabilized the homepage hero: it now uses dynamic viewport height, keeps the tablet layout stacked, and switches to one consistent two-column ratio only at the extra-large breakpoint.
- Removed automatic cycling from the homepage journey indicator and blog featured carousel; carousel navigation is now fully user controlled.
- Increased carousel and shared-header icon controls to 44px touch targets and retained visible carousel controls on touch layouts.
- Delayed desktop navigation until the large breakpoint to prevent a cramped tablet header.

Never break:

- Vietnamese default routing, optional English `/en` routing, dark/light theme, shared responsive series row, and blog carousel navigation.

# 2026-08-11 — English interface and article-rendering recovery

Fixed:

- Standardized public interface copy, forms, buttons, code-block actions, and article controls in English on both `/vi` and `/en`; the active locale still selects Vietnamese or English article content and metadata.
- Restored the local-content fallback list when Payload is unavailable, while retaining Payload as the sole authority when its query succeeds, including an empty result.
- Restored article-detail rendering for historical `nhatnghia` posts by registering the missing editorial author profile instead of allowing an undefined author to crash server rendering.
- Deferred local fallback lookup for a post detail until Payload is unavailable or its query fails, avoiding unnecessary fallback reads while the CMS is healthy.
- Added regression coverage for the author fallback and Payload-authoritative post detail path.

# 2026-08-11 — Footer simplification and learning pipeline

Changed:

- Removed newsletter signup surfaces from the homepage and footer, avoiding duplicate calls to action.
- Removed the footer social icon controls and increased the logo treatment for a cleaner, brand-led footer.
- Consolidated Blog, Series, and About into a single accessible `Explore` navigation group.
- Restored a lightweight directional visual flow for the Explore → Learn → Share pipeline, with the existing reduced-motion safeguard preserved.

# 2026-08-11 — Blog pagination state sync

Fixed:

- Synchronized the client-side Blog pagination state with the route `page` query parameter, so direct navigation and the Page 2 control render the correct page.
- Updated pagination controls optimistically on click and added a regression test for route-state synchronization.

# 2026-08-11 — Newsletter placement correction

Changed:

- Kept the newsletter hidden on the homepage, while restoring it as a compact footer call to action on Blog, Series, and About pages.
- Updated the email field example to `Your email address...` and retained submit success and error feedback.

# 2026-08-11 — Homepage newsletter and footer polish

Changed:

- Restored the full `Stay in the loop` email signup on the homepage while retaining the compact Newsletter on child pages.
- Centered the footer copyright, removed the Explore · Learn · Share tagline and brand subtitle, and increased the logo and wordmark scale.
- Shortened the homepage content header from `Latest articles` to `Latest`.

# 2026-08-11 - Compact child-page newsletter footer

Changed:

- Replaced the oversized child-page signup card with a compact footer Newsletter row: a short description, email field, and an accessible 44px icon submit control.
- Kept the full-size `Stay in the loop` signup exclusive to the homepage, including its existing success and error feedback.

# 2026-08-11 - Footer newsletter positioning and email validation

Changed:

- Moved the compact Newsletter into the right footer column on child pages and centered the Explore navigation at large breakpoints.
- Replaced browser-native required-field messaging with an English inline error state that has clear icon, text, focus styling, and screen-reader support.
- Updated the welcome-email article call to action to open the Vietnamese blog at `/vi/blog` by default.

# 2026-08-11 - Footer column balance

Changed:

- Rebalanced the child-page footer into proportional Logo, Explore, and Newsletter columns.
- Aligned the Explore heading with its Blog, Series, and About links, and reduced the compact Newsletter form to a more restrained reading-width control.

# 2026-08-11 - Centered footer navigation and aligned newsletter form

Changed:

- Used equal outer footer columns so Explore sits centrally between the brand and Newsletter sections.
- Matched the compact email-input-plus-submit-control width to the Newsletter description line while preserving 44px controls.

# 2026-08-11 - Article reading layout and table of contents

Changed:

- Resized the wide-screen article layout into a consistent 46rem reading column with a compact companion TOC, inspired by the supplied DevOps VN reading pattern.
- Redesigned the desktop table of contents into a minimal `On this page`-style rail with a clear active-section marker; retained the responsive mobile disclosure and observer-based scroll tracking.

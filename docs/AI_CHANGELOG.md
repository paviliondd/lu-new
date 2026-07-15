# AI Changelog

Every Codex code or workflow change must update this file.

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

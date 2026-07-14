# AI Changelog

Every Codex code or workflow change must update this file.

## 2026-07-14

Added:

- Added regression coverage for immutable ECR tagging and registry deployments that must not rebuild on the VPS.
- Added regression coverage for the homepage query limits and carousel removal, icon-only Copy control, observer-based TOC behavior, Media volume ownership initialization, and Sharp WebAssembly fallback.
- Added a one-shot Compose `media-permissions` service so the non-root app user can safely write to the existing `payload_media` volume.
- Added read-only legacy Media detail hydration so Payload Admin can resolve imported files and derive missing preview dimensions without a schema change, migration, or database backfill.

Changed:

- Changed production ECR publishing to tag each verified image as `latest`, `production`, and the immutable Git commit SHA.
- Changed VPS production deployment to pull the exact commit-tagged ECR image and start it with `--no-build`, while preserving source builds as the manual fallback.
- Changed Docker dependency stages to remove Sharp's incompatible native `linux-x64` packages after installing the official WASM runtime, and fail fast unless Emscripten is actually selected.
- Removed the hero carousel from the homepage render tree while preserving the shared carousel used on the blog page.
- Limited homepage Payload queries to six newest published posts and three newest series, and added the Collections/Series heading with localized view-all links.
- Changed code block Copy controls to icon-only output while preserving Clipboard API behavior, accessible labels/tooltips, and the two-second success state.
- Replaced the TOC window scroll listener with IntersectionObserver scroll-spy behavior, a sticky viewport-bounded scroll container, and nearest-item auto-scroll.

Fixed:

- Fixed production builds and Next image optimization failing because Sharp's native `linux-x64` binary requires an x86-64 v2 CPU.
- Fixed ECR deployments rebuilding the application on the VPS instead of running the already verified image pushed by CI.
- Fixed legacy imported Media file requests being converted into Payload 500 responses by resolving the imported file before invoking the Payload file handler.
- Fixed Media Save failures caused by unwritable Docker volume ownership and improved duplicate, validation, missing-file, and rename errors in Vietnamese.
- Fixed Payload Image Editor previews with missing legacy width/height metadata while leaving all existing Media records unchanged.

Never break:

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

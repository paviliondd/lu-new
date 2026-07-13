# AI Changelog

Every Codex code or workflow change must update this file.

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

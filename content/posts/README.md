# Localized Article Files

Payload CMS is authoritative whenever it is reachable. Local MDX files are kept only as a development/build or outage fallback; they are not merged into a successful CMS response. Deleting a post or series in Payload must therefore remove it from the public site even if a matching local fallback file still exists.

Use one file per locale:

```text
content/posts/<slug>.vi.mdx
content/posts/<slug>.en.mdx
```

Supported frontmatter:

```yaml
---
title: Article title
description: Short SEO description
date: 2026-06-10
author: nhatnghia
category: DevOps
tags:
  - Linux
  - Kubernetes
series: linuxunity-devops-series
seoTitle: Optional SEO title
seoDescription: Optional SEO description
ogImage: /images/example.webp
---
```

The application resolves the requested locale first. Missing English MDX falls back to Vietnamese MDX in development.

## Rendering safety

Both local fallback HTML and Payload rich text pass through the same article sanitizer. Layout utility classes from imported HTML are removed before rendering to prevent positioning, negative-margin, grid, and line-height class collisions from making preview or published text overlap. Semantic classes used by code languages, notes, rich-text blocks, and topology figures are retained. This normalization is render-only and does not rewrite MDX files or Payload records.

Payload preview links include the saved document revision. Save the draft before opening Preview; after each save, the changed revision parameter forces a fresh preview request instead of reusing a stale preview-tab route. This affects only the preview URL and does not modify post content.

The prepared article HTML is passed to the frontend as a serializable string and rendered as one atomic article-content island. Do not pass the parsed rich-text React tree as `children` through a client layout/provider: React/Next streaming can expose an incomplete intermediate DOM where table cells and structured blocks temporarily appear as flattened prose. Table controls remain small client islands around server-safe table markup. This is a rendering architecture rule only and does not rewrite Payload records.

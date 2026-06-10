# Localized article files

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

The application resolves the requested locale first. A missing local file falls
back to the locale-aware WordPress REST API and then to the generated local data.

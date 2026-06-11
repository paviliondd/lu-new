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
back to WordPress only when the REST response explicitly identifies the same
locale. Supported WordPress signals are:

- A multilingual plugin exposing `lang: "vi"` or `lang: "en"`.
- A REST-visible custom field named `linuxunity_locale`, `locale`, or `language`.
- A localized slug ending in `-vi`, `.vi`, `-en`, or `.en`.

Legacy WordPress posts without locale metadata are treated as Vietnamese. They
are never reused on `/en`, which prevents Vietnamese titles and content from
leaking into the English site.

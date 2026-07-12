# LinuxUnity Architecture and Editor Notes

## Folder Structure

- `backend/`: PayloadCMS deployment surface, backend Dockerfile, backend env files, and future backend-only modules.
- `frontend/`: Next.js deployment surface, frontend Dockerfile, frontend env files, and future frontend-only modules.
- `infra/`: Docker Compose, Nginx, Caddy, Terraform, and Kubernetes deployment files.
- `src/config/`: frontend-facing configuration for site, navigation, footer, homepage, and SEO.
- `src/`: current application source. The project still runs as a Next.js + Payload app while the deployment surface is split.

## Content Editing

Payload posts use Lexical RichText fields:

- `contentRichVi`
- `contentRichEn`

Legacy fields are kept only as fallback:

- `contentVi`
- `contentEn`

Run this after deploying the editor changes:

```bash
npm run payload -- migrate
npm run payload:migrate-richtext
```

## Frontend Content Configuration

To change frontend identity and static UI content, edit:

- `src/config/site.ts`: site name, description, logo, social links.
- `src/config/navigation.ts`: main menu.
- `src/config/footer.ts`: footer columns and links.
- `src/config/homepage.ts`: homepage technology cards.
- `src/config/seo.ts`: default SEO metadata.

## Deploy

Create or update env files from examples:

```bash
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
copy infra\.env.example infra\.env
```

Then deploy:

```bash
cd infra
docker compose up -d --build
```

## Code Blocks

Markdown and Lexical code blocks render with:

- language label
- copy button
- copied state for 2 seconds
- Shiki syntax highlighting
- light and dark themes

Mermaid blocks render as diagrams with zoom controls.

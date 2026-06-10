# Cloud DevOps Blog

## Tổng quan

Đây là mã nguồn website/blog Cloud DevOps dùng để triển khai nội dung học tập, ghi chú kỹ thuật, bài lab và tài liệu liên quan đến Linux, DevOps, Cloud, AWS, Docker, Kubernetes và các chủ đề hạ tầng.

Website được quản lý mã nguồn bằng GitHub và triển khai lên VPS thông qua CI/CD.

Stack hiện tại:

- Frontend: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4.
- CMS: Headless WordPress qua REST API.
- Production runtime: Docker Compose với Caddy, Next.js, WordPress và MariaDB.
- Domain production dự kiến: `tesst.linuxunity.com`.

## Mục tiêu dự án

- Quản lý source code rõ ràng bằng Git.
- Tách biệt môi trường phát triển, test và production.
- Chuẩn hoá luồng làm việc với các branch:
  - `main`
  - `develop`
  - `feature/*`
  - `bugfix/*`
  - `hotfix/*`
- Tự động deploy lên VPS khi có thay đổi mới được merge/push vào `main`.
- Giữ an toàn cho dữ liệu thật, file cấu hình production và secret.
- Không commit `.env`, backup, upload, cache, database dump hoặc secret lên GitHub.

## Cấu trúc thư mục

```text
.
├── README.md
├── .gitattributes
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── .github/
│   └── workflows/
│       └── deploy-production.yml
├── content/
│   ├── roadmap-draft-posts.json
│   └── roadmap-draft-posts.wordpress.json
├── deploy/
│   ├── README.md
│   ├── caddy/
│   │   └── Caddyfile
│   └── wordpress/
│       └── uploads.ini
├── docs/
│   ├── CICD_DEPLOYMENT.md
│   ├── GIT_WORKFLOW.md
│   └── headless-wordpress-roadmap.md
├── scripts/
│   ├── backup.sh
│   ├── backup-wordpress.sh
│   ├── deploy.sh
│   ├── import-roadmap-to-wordpress.mjs
│   ├── list-wordpress-drafts.mjs
│   ├── restore.sh
│   └── restore-wordpress.sh
├── public/
└── src/
    ├── app/
    │   ├── api/
    │   ├── blog/
    │   ├── components/
    │   ├── data.ts
    │   ├── layout.tsx
    │   └── page.tsx
    └── lib/
        └── cms/
            └── wordpress.ts
```

## Luồng deploy tổng quan

```text
Local machine
   ↓ git commit
   ↓ git push
GitHub Repository
   ↓ GitHub Actions
VPS
   ↓ git fetch / git reset origin/main
   ↓ docker compose pull / docker compose up -d
Production Website
```

## Branch chính

| Branch      | Mục đích                    | Deploy production          |
| ----------- | --------------------------- | -------------------------- |
| `main`      | Production                  | Có                         |
| `develop`   | Test/tích hợp               | Không deploy production    |
| `feature/*` | Tính năng mới               | Không                      |
| `bugfix/*`  | Sửa lỗi thường              | Không                      |
| `hotfix/*`  | Sửa lỗi khẩn cấp production | Merge vào `main` để deploy |

## Cách clone source

```bash
git clone git@github.com:paviliondd/lu-new.git
cd lu-new
```

## Cách chạy local

```bash
npm ci
npm run dev
```

Mở:

```text
http://localhost:3000
```

## Cách làm việc cơ bản

Tạo branch tính năng mới:

```bash
git switch develop
git pull origin develop
git switch -c feature/ten-tinh-nang
```

Commit thay đổi:

```bash
git status
git add .
git commit -m "Add feature ..."
git push -u origin feature/ten-tinh-nang
```

Sau đó tạo Pull Request:

```text
feature/ten-tinh-nang → develop
```

Khi test ổn, tạo Pull Request:

```text
develop → main
```

Khi `main` được cập nhật, CI/CD sẽ deploy lên VPS.

## Production Docker Compose

Xem hướng dẫn chi tiết tại:

- [VPS Deployment](./deploy/README.md)

Các dịch vụ production:

- Caddy reverse proxy + HTTPS.
- Next.js frontend.
- WordPress backend tại `/wp-admin`.
- MariaDB database nội bộ.

Chỉ expose public ports:

- `80`
- `443`

## Tài liệu liên quan

- [Git Workflow](./docs/GIT_WORKFLOW.md)
- [CI/CD Deployment](./docs/CICD_DEPLOYMENT.md)
- [Headless WordPress Roadmap](./docs/headless-wordpress-roadmap.md)
- [VPS Deployment](./deploy/README.md)

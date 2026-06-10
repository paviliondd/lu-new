# CI/CD Deployment

## Muc tieu

Tai lieu nay mo ta cach deploy production cho `tesst.linuxunity.com` bang GitHub Actions va VPS.

Nguyen tac chinh:

- Chi deploy production khi code vao branch `main`.
- Khong commit `.env`, backup, upload, database dump hoac secret len GitHub.
- VPS giu file `.env` rieng va Docker volumes rieng.
- Deploy script chi cap nhat code, dang nhap ECR, pull image va restart container, khong xoa database volume hoac WordPress uploads.

## Kien truc hien tai

```text
GitHub main
   -> GitHub Actions
   -> SSH vao VPS
   -> scripts/deploy.sh
   -> git fetch/reset origin/main
   -> docker compose config
   -> docker compose pull
   -> docker compose up -d
```

Production stack:

- `caddy`: reverse proxy va HTTPS tu dong.
- `app`: Next.js frontend.
- `wordpress`: WordPress admin va REST API.
- `db`: MariaDB noi bo.
- `wpcli`: profile tools, chi chay khi can quan tri WordPress.

Public ports:

- `80`
- `443`

Khong expose database port ra Internet.

## Branch deploy

| Branch | Muc dich | Deploy production |
| --- | --- | --- |
| `main` | Production | Co |
| `develop` | Tich hop va test | Khong |
| `feature/*` | Tinh nang moi | Khong |
| `bugfix/*` | Sua loi thuong | Khong |
| `hotfix/*` | Sua loi production khan cap | Sau khi merge vao `main` |

## GitHub secrets can tao

Vao GitHub repository:

```text
Settings -> Secrets and variables -> Actions -> New repository secret
```

Them cac secret sau:

```text
VPS_HOST=<public-ip-or-hostname>
VPS_PORT=22
VPS_USER=<ssh-user>
VPS_SSH_KEY=<private-ssh-key-for-deploy>
APP_DIR=/opt/linuxunity
AWS_ACCESS_KEY_ID=<aws-access-key-id>
AWS_SECRET_ACCESS_KEY=<aws-secret-access-key>
AWS_DEFAULT_REGION=ap-southeast-1
AWS_ECR_REGISTRY=123456789012.dkr.ecr.ap-southeast-1.amazonaws.com
AWS_ECR_REPOSITORY=cloud-devops-blog
```

Khong dua noi dung `.env` vao GitHub Actions logs. File `.env` production nen duoc tao truc tiep tren VPS.

## Chuan bi VPS lan dau

Install Git, Docker Engine va Docker Compose v2 tren VPS.

Clone repository:

```bash
sudo mkdir -p /opt/linuxunity
sudo chown "$USER:$USER" /opt/linuxunity
git clone git@github.com:paviliondd/lu-new.git /opt/linuxunity
cd /opt/linuxunity
```

Tao file environment production:

```bash
cp .env.example .env
nano .env
```

Doi toan bo password placeholder trong `.env`.

Kiem tra DNS:

```text
A tesst.linuxunity.com -> <VPS_PUBLIC_IP>
A/CNAME www.tesst.linuxunity.com -> <VPS_PUBLIC_IP>
```

Start lan dau:

```bash
docker compose config
docker compose pull
docker compose up -d
docker compose ps
docker compose logs -f caddy app wordpress db
```

Mo WordPress admin:

```text
https://tesst.linuxunity.com/wp-admin
```

## Workflow GitHub Actions

File workflow:

```text
.github/workflows/deploy-production.yml
```

Workflow thuc hien:

1. Checkout source.
2. Cai Node.js 24.
3. Chay `npm ci`.
4. Chay `npm run lint`.
5. Chay `npm run build`.
6. Dang nhap AWS ECR.
7. Build Docker image Next.js.
8. Push image len ECR voi tags `production` va commit SHA.
9. Neu tat ca pass va branch la `main`, SSH vao VPS.
10. VPS dang nhap ECR, pull image va chay `bash scripts/deploy.sh`.

## Deploy thu cong tren VPS

```bash
cd /opt/linuxunity
bash scripts/deploy.sh
```

Co the override branch neu can:

```bash
DEPLOY_BRANCH=main bash scripts/deploy.sh
```

## Lenh van hanh

Start:

```bash
docker compose up -d
```

Stop:

```bash
docker compose down
```

Logs:

```bash
docker compose logs -f
docker compose logs -f caddy app wordpress db
```

Trang thai:

```bash
docker compose ps
```

Health check:

```bash
curl -fsS https://tesst.linuxunity.com/api/health
curl -I https://tesst.linuxunity.com/wp-admin
```

Backup:

```bash
scripts/backup.sh
```

Check WordPress REST API authentication for draft import:

```bash
docker compose run --rm --no-deps app node scripts/check-wordpress-auth.mjs
```

Restore:

```bash
CONFIRM_RESTORE=yes scripts/restore.sh ./backups/YYYYMMDD-HHMMSS
```

Restore se ghi de WordPress database va overlay uploads tu backup. Chi chay khi thuc su can rollback du lieu.

## Rollback code

Rollback code khong tu dong rollback database.

```bash
cd /opt/linuxunity
git log --oneline -n 10
git reset --hard <commit-id>
docker compose pull
docker compose up -d
docker compose ps
```

Neu su co lien quan noi dung WordPress/database, dung backup da tao truoc do va doc ky huong dan restore.

## Firewall co ban

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
ufw status
```

Khong mo port MariaDB/MySQL cong khai.

## Checklist sau deploy

- `https://tesst.linuxunity.com` hien thi frontend.
- `https://tesst.linuxunity.com/api/health` tra ve OK.
- `https://tesst.linuxunity.com/wp-admin` vao duoc man hinh login/admin.
- `https://tesst.linuxunity.com/?rest_route=/wp/v2/posts` truy cap duoc REST API.
- `docker compose ps` khong co service restart loop.
- Draft posts chi hien trong WordPress admin; frontend public chi lay bai `publish`.

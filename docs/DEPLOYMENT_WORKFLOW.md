# Quy trình triển khai LinuxUnity: local → develop → staging → production

Tài liệu vận hành ngắn gọn cho release hiện hành: SVG upload an toàn, Series landing/preview, Mermaid/ASCII topology và Blog không còn Featured carousel.

Tài liệu cấu hình staging chi tiết: [`STAGING_DEPLOYMENT.md`](./STAGING_DEPLOYMENT.md). Quy trình backup/rollback production: [`CICD_DEPLOYMENT.md`](./CICD_DEPLOYMENT.md).

## 0. Trạng thái hiện tại

- Nhánh staging: `develop`.
- Nhánh production: `main`.
- Staging host: `dev.linuxunity.com`.
- Origin VPS staging đã được xác định: `103.110.85.93`.
- DNS hiện đi qua Cloudflare. Khi kiểm tra lúc viết tài liệu, Cloudflare trả `HTTP 521`, nghĩa là DNS/proxy đã nhận request nhưng origin chưa chấp nhận kết nối HTTPS. Đây không phải lỗi ứng dụng Next/Payload; cần hoàn thành cấu hình VPS/Nginx/TLS bên dưới.

Không dùng chung host runtime, `.env`, Postgres, Redis, media volume, OAuth application, SMTP credential hoặc thư mục backup giữa staging và production.

## 1. Luồng release bắt buộc

```text
local feature work
  → feature/*
  → develop
  → GitHub Actions: verify + immutable ECR image + staging deploy
  → QA tại dev.linuxunity.com
  → PR develop → main
  → GitHub Actions: production backup + production deploy
```

Không push trực tiếp vào `main`. Không dùng tag image mutable để deploy.

## 2. Chuẩn bị VPS staging (một lần)

Đăng nhập VPS `103.110.85.93`, sau đó cài Docker, Compose v2, Git và AWS CLI theo chuẩn hệ điều hành. Tạo thư mục ứng dụng và checkout đúng nhánh:

```bash
sudo mkdir -p /opt/linuxunity-staging
sudo chown "$USER":"$USER" /opt/linuxunity-staging

git clone git@github.com:paviliondd/lu-new.git /opt/linuxunity-staging
cd /opt/linuxunity-staging
git checkout develop
```

Tạo môi trường staging:

```bash
cp .env.staging.example .env
chmod 600 .env
```

Điền toàn bộ `CHANGE_ME`; không copy secrets production. Các giá trị isolation phải giữ:

```dotenv
COMPOSE_PROJECT_NAME=linuxunity-staging
SITE_ENVIRONMENT=staging
SERIES_PREVIEW_ENABLED=true
SITE_DOMAIN=dev.linuxunity.com
POSTGRES_DB=payload_staging
POSTGRES_USER=payload_staging
REDIS_KEY_PREFIX=linuxunity:staging
BACKUP_ROOT=./backups-staging
```

Kiểm tra trước khi khởi động:

```bash
cd /opt/linuxunity-staging
docker compose config >/dev/null
docker compose config --volumes
```

Mọi volume phải bắt đầu bằng `linuxunity-staging_`. Dừng lại nếu có volume production.

## 3. DNS, Cloudflare, cổng mạng và TLS

### DNS

Giữ A record `dev.linuxunity.com` hướng về `103.110.85.93`. Nếu dùng Cloudflare proxy (orange cloud), DNS lookup sẽ hiển thị IP Cloudflare thay vì origin—đó là bình thường.

### Firewall/security group

Mở tối thiểu:

```text
TCP 80   từ Internet     (Let's Encrypt HTTP-01 và redirect HTTP)
TCP 443  từ Internet     (website)
TCP 22   chỉ từ IP quản trị/VPN
```

### Chẩn đoán HTTP 521

Trên VPS chạy:

```bash
sudo ss -ltnp | grep -E ':(80|443|8080)'
cd /opt/linuxunity-staging
docker compose ps
docker compose logs --tail=150 nginx app postgres redis
curl -fsS http://127.0.0.1:8080/api/health
```

`521` thường được giải quyết khi Nginx chạy, bind được port 80/443, firewall mở và origin certificate/configuration phù hợp. Để cô lập lỗi Cloudflare, tạm chuyển record sang DNS-only (gray cloud), kiểm tra HTTPS trực tiếp, sau đó bật proxy lại khi origin ổn định.

### Cấp certificate lần đầu

Sau khi `dev.linuxunity.com` resolve đúng VPS và port 80 đến được origin:

```bash
cd /opt/linuxunity-staging
docker compose --profile tools run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d dev.linuxunity.com \
  --email <ADMIN_EMAIL> \
  --agree-tos --no-eff-email

docker compose restart nginx
curl -fsS https://dev.linuxunity.com/api/health
```

Nếu dùng `www.dev.linuxunity.com`, thêm A/CNAME record và `-d www.dev.linuxunity.com`; nếu không, không thêm host đó vào `.env` hay Certbot command.

## 4. GitHub Environment và CI/CD (một lần)

Tạo GitHub Environment tên `staging`, bật Required reviewers nếu có người duyệt deployment.

Repository secrets bắt buộc:

```text
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_DEFAULT_REGION
AWS_ECR_REGISTRY
AWS_ECR_REPOSITORY
```

Environment secrets `staging`:

```text
STAGING_VPS_HOST=103.110.85.93
STAGING_VPS_USER=<SSH_USER>
STAGING_VPS_PORT=22
STAGING_VPS_SSH_KEY=<PRIVATE_DEPLOY_KEY>
STAGING_APP_DIR=/opt/linuxunity-staging
```

Workflow `.github/workflows/deploy-staging.yml` chạy khi có push vào `develop` hoặc qua `workflow_dispatch`. Nó thực hiện `npm ci`, lint, test, build, build/push ECR image theo SHA bất biến, backup staging, deploy và healthcheck. Workflow staging không cập nhật tag production.

## 5. Deploy staging hằng ngày

1. Hoàn thành công việc ở `feature/*` và chạy local gates:

```bash
npm run lint
npm test
npm run build
```

2. Push/merge vào `develop`.
3. Mở GitHub Actions → **Deploy Staging** để theo dõi. Có thể chạy lại bằng **Run workflow** và chọn `develop`.
4. Sau job thành công, xác minh trên VPS:

```bash
cd /opt/linuxunity-staging
docker compose ps
curl -fsS http://127.0.0.1:8080/api/health
docker compose exec -T app npx --no-install payload migrate:status
```

5. Xác minh từ Internet:

```bash
curl -fsS https://dev.linuxunity.com/api/health
curl -fsS https://dev.linuxunity.com/robots.txt
```

Trên staging, `/robots.txt` phải chứa `Disallow: /`.

## 6. Kiểm thử nội dung ở staging

1. Đăng nhập `https://dev.linuxunity.com/admin`.
2. Upload một SVG có alt text; xác nhận nó render trong post hoặc cover. SVG có active content phải bị loại bỏ/từ chối, không được thực thi.
3. Tạo Series `Draft`, thêm introduction VI/EN, learning points, cover và Posts `Draft` với `chapterOrder`.
4. Duyệt:

```text
https://dev.linuxunity.com/vi/series-preview/<series-slug>
https://dev.linuxunity.com/en/series-preview/<series-slug>
```

5. Kiểm tra desktop và mobile:
   - Blog không có Feature carousel/badge;
   - code block, ASCII topology và Mermaid không gây document horizontal scroll;
   - ASCII panel giữ đầy đủ bốn góc và scroll ngang ngay trong panel;
   - cover image giữ crop/focal point;
   - series/chapter draft có đúng nội dung và thứ tự.

Không dùng staging để thử SMTP gửi thật; dùng sandbox hoặc tắt SMTP. Nếu nội dung chưa công bố nhạy cảm, đặt staging sau Cloudflare Access, VPN hoặc IP allowlist—`noindex` không phải xác thực.

## 7. Promote production

Chỉ làm sau khi staging QA đạt:

1. Tạo PR `develop` → `main`.
2. Review source diff, GitHub Actions và migration status.
3. Merge PR.
4. Production workflow backup dữ liệu trước migration/deploy, pull ECR image SHA, healthcheck và chỉ sau đó promote tag `production`.
5. Smoke test production:

```bash
curl -fsS https://linuxunity.com/api/health
curl -I https://linuxunity.com/admin
```

6. Trong Payload production: publish Post trước, publish Series cuối cùng; kiểm tra public URLs, API và media SVG.

## 8. Rollback

Rollback application image không ghi đè database/media:

```bash
cd /opt/linuxunity-staging
CONFIRM_ROLLBACK=yes bash scripts/rollback.sh image
```

Chỉ dùng full rollback khi đã chọn đúng staging recovery point và chấp nhận mất các dữ liệu sinh sau snapshot:

```bash
CONFIRM_ROLLBACK=yes bash scripts/rollback.sh full \
  --archive /absolute/path/to/staging-backup.tar.gz
```

Không restore backup production sang staging hay backup staging sang production.

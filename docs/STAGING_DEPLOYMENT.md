# Staging và quy trình xuất bản Series

Tài liệu này đưa môi trường `dev.linuxunity.com` vào hoạt động bằng cùng repository nhưng tách hoàn toàn runtime và dữ liệu khỏi production. Trang tham khảo bên ngoài chỉ được dùng để tham khảo bố cục; mã nguồn, fixture và CMS của LinuxUnity không chứa dữ liệu sao chép từ website đó.

## 1. Kiến trúc được hỗ trợ

Luồng chuẩn:

```text
feature/* -> workflow_dispatch -> dev.linuxunity.com -> duyệt
          -> PR/merge develop -> staging tự deploy
          -> PR/merge main -> production deploy
```

Khuyến nghị dùng một VPS staging riêng:

```text
dev.linuxunity.com
  -> stack Compose linuxunity-staging
  -> Postgres volume linuxunity-staging_payload_postgres_data
  -> Redis volume linuxunity-staging_redis_data
  -> Payload media volume linuxunity-staging_payload_media
```

Production và staging không được dùng chung `.env`, Postgres, Redis, media volume, OAuth app, SMTP credential hoặc backup directory. `COMPOSE_PROJECT_NAME=linuxunity-staging` tạo namespace riêng; VPS riêng tạo thêm isolation ở mức host.

Nếu buộc phải chạy chung VPS, phải đổi toàn bộ bind port và cấu hình reverse proxy phía trước. Không chạy nguyên `.env.staging.example` cùng host production vì cả hai stack mặc định bind `80/443`.

## 2. Chuẩn bị DNS và VPS

1. Tạo VPS Ubuntu riêng cho staging.
2. Tạo DNS A/AAAA:
   - `dev.linuxunity.com` -> IP staging VPS.
   - Tùy chọn: `www.dev.linuxunity.com`, `project-dev.linuxunity.com`, `kuma-dev.linuxunity.com`.
3. Cài Docker Engine, Docker Compose v2, Git và AWS CLI.
4. Clone repository:

```bash
sudo mkdir -p /opt/linuxunity-staging
sudo chown "$USER":"$USER" /opt/linuxunity-staging
git clone <REPOSITORY_URL> /opt/linuxunity-staging
cd /opt/linuxunity-staging
git checkout develop
```

5. Tạo cấu hình staging:

```bash
cp .env.staging.example .env
chmod 600 .env
```

Thay mọi giá trị `CHANGE_ME`. Không copy secret production. Giữ nguyên các giá trị isolation:

```dotenv
COMPOSE_PROJECT_NAME=linuxunity-staging
SITE_ENVIRONMENT=staging
SERIES_PREVIEW_ENABLED=true
POSTGRES_DB=payload_staging
POSTGRES_USER=payload_staging
REDIS_KEY_PREFIX=linuxunity:staging
```

Kiểm tra trước khi chạy:

```bash
docker compose config >/dev/null
docker compose config --volumes
```

Tên volume phải có prefix `linuxunity-staging_`. Dừng ngay nếu output trỏ tới volume production.

## 3. GitHub Environment và secrets

Trong GitHub, tạo Environment `staging`. Nên bật Required reviewers và giới hạn deployment branch theo nhu cầu của nhóm.

Repository/ECR secrets dùng chung với workflow production:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_DEFAULT_REGION`
- `AWS_ECR_REGISTRY`
- `AWS_ECR_REPOSITORY`

Secrets riêng trong Environment `staging`:

- `STAGING_VPS_HOST`
- `STAGING_VPS_USER`
- `STAGING_VPS_PORT`
- `STAGING_VPS_SSH_KEY`
- `STAGING_APP_DIR` = `/opt/linuxunity-staging`

Workflow `.github/workflows/deploy-staging.yml`:

- tự chạy khi push vào `develop`;
- có thể chạy thủ công từ một `feature/*` bằng Actions -> Deploy Staging -> Run workflow;
- dùng Node.js 24, `npm ci`, lint, test và build;
- push image ECR với tag Git SHA bất biến;
- deploy đúng SHA và không tạo/cập nhật tag `production`;
- tạo backup staging trước khi app mới khởi động.

## 4. Deploy lần đầu

### 4.1 Chạy workflow

Từ GitHub Actions, chạy `Deploy Staging` trên branch cần duyệt. Workflow sẽ đồng bộ đúng commit SHA lên VPS và chạy `scripts/deploy.sh`.

Kiểm tra tại VPS:

```bash
cd /opt/linuxunity-staging
docker compose ps
docker compose logs --tail=120 app postgres redis nginx
curl -fsS http://127.0.0.1:8080/api/health
```

### 4.2 Cấp TLS

Lần đầu Nginx chạy HTTP-only nếu chưa có certificate. Sau khi DNS đã resolve đúng VPS:

```bash
cd /opt/linuxunity-staging
docker compose --profile tools run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d dev.linuxunity.com \
  -d www.dev.linuxunity.com \
  --email <ADMIN_EMAIL> \
  --agree-tos --no-eff-email
docker compose restart nginx
curl -fsS https://dev.linuxunity.com/api/health
```

Nếu không dùng `www.dev.linuxunity.com`, bỏ domain đó khỏi lệnh certbot và `.env`.

### 4.3 Xác minh migration và dữ liệu

`src/migrations/20260815_000001_add_series_landing_fields.ts` chỉ thêm cột/bảng. Migration đánh dấu các Series đã tồn tại là `published`, vì vậy việc nâng cấp không làm chúng biến mất khỏi website. Migration `20260730_000001_add_chapter_order.ts` đã tồn tại và field `chapterOrder` chỉ được nối lại vào Payload Admin.

Trước mọi schema deployment, backup phải thành công. Sau deploy kiểm tra:

```bash
docker compose exec -T app npx --no-install payload migrate:status
docker compose exec -T postgres psql -U payload_staging -d payload_staging -c \
  "select status, count(*) from series group by status order by status;"
docker compose exec -T postgres psql -U payload_staging -d payload_staging -c \
  "select count(*) from posts;"
```

Không chạy `payload migrate` thủ công trên production nếu chưa có backup và chưa kiểm tra migration status. Adapter hiện hành quản lý schema khi app khởi động; file migration là lịch sử có thể kiểm tra và dùng trong quy trình migration có kiểm soát.

## 5. Nhập nội dung Series trong Payload

Mở:

```text
https://dev.linuxunity.com/admin
```

### Tạo hoặc sửa Series

Vào Collections -> Series:

1. Đặt `Status = Draft`.
2. Nhập `Title VI`, `Title EN`, slug và mô tả ngắn.
3. Chọn `Series Cover Image` nếu cần.
4. Viết phần `Introduction VI/EN` trong rich-text editor.
5. Thêm `Learning Points VI/EN` theo từng dòng.
6. Lưu nhưng chưa chuyển Series sang Published.

Payload Preview mở URL:

```text
https://dev.linuxunity.com/vi/series-preview/<series-slug>
https://dev.linuxunity.com/en/series-preview/<series-slug>
```

Route preview chỉ hoạt động khi `SERIES_PREVIEW_ENABLED=true`, luôn có metadata `noindex, nofollow`, và hiển thị banner staging.

### Thiết lập chapter

Với mỗi Post trong Series:

1. Chọn relationship `Series`.
2. Nhập `Chapter Order` ổn định: `0`, `1`, `2`, ...
3. Giữ `Status = Draft` khi đang biên tập.
4. Lưu bài viết.

Trang preview hiển thị cả draft chapter và badge `Bản nháp`. Trang public chỉ truy vấn post `published`. Nếu `Chapter Order` chưa có, hệ thống fallback sang số chapter trong tiêu đề rồi mới đến ngày đăng.

Có thể kiểm tra API sau khi đăng nhập Payload Admin:

```text
https://dev.linuxunity.com/api/payload/series?where[slug][equals]=<series-slug>
https://dev.linuxunity.com/api/payload/posts?where[series][exists]=true
```

## 6. Duyệt và public

Checklist duyệt staging:

1. Desktop và mobile không có scroll ngang toàn trang.
2. Cover giữ đúng crop/focal point.
3. Introduction VI/EN đúng nội dung.
4. Learning points đúng ngôn ngữ.
5. Chapter đúng thứ tự và draft badge đúng.
6. Topology ASCII giữ đủ bốn góc và cuộn ngang trong panel trên mobile.
7. `/robots.txt` trên staging trả `Disallow: /`.
8. Không có dữ liệu production nhạy cảm trong staging.

Khi nội dung sẵn sàng:

1. Chuyển các Post cần public sang `Published`.
2. Chuyển Series sang `Published` cuối cùng.
3. Xác minh URL public staging:
   `https://dev.linuxunity.com/vi/blog/series/<series-slug>`.
4. Mở PR từ feature vào `develop`, duyệt staging lần cuối.
5. Mở PR từ `develop` vào `main`.
6. Production workflow phải tạo backup, deploy đúng image SHA và healthcheck thành công.
7. Kiểm tra production API trực tiếp; không suy luận từ cache hoặc fallback files.

Series draft không xuất hiện trong danh sách hoặc route public. Một CMS query thành công nhưng rỗng vẫn là kết quả authoritative; code không trộn fallback Series vào kết quả Payload rỗng.

## 7. Bảo vệ staging

`SITE_ENVIRONMENT=staging` làm `/robots.txt` chặn toàn bộ crawler. Đây không phải cơ chế xác thực. Nếu nội dung chưa công bố có tính nhạy cảm, đặt `dev.linuxunity.com` sau Cloudflare Access, VPN hoặc IP allowlist. Không dựa vào URL khó đoán.

OAuth callback phải dùng app OAuth staging riêng. SMTP staging nên tắt hoặc dùng inbox sandbox để tránh gửi mail thật.

## 8. Rollback staging

Rollback image nhưng giữ dữ liệu:

```bash
cd /opt/linuxunity-staging
CONFIRM_ROLLBACK=yes bash scripts/rollback.sh image
```

Chỉ restore database/media khi migration đã thay đổi dữ liệu và đã chọn đúng recovery point staging. Full restore là destructive:

```bash
CONFIRM_ROLLBACK=yes bash scripts/rollback.sh full \
  --archive /absolute/path/to/staging-backup.tar.gz
```

Không dùng backup production làm lệnh rollback mặc định cho staging và không dùng backup staging để ghi đè production.

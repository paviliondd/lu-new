# CI/CD, Backup, and Rollback Runbook

## Nguyên tắc vận hành

- GitHub Actions là nơi duy nhất build production image.
- Mỗi image production có tag Git commit SHA bất biến và được lưu tại ECR.
- VPS chỉ `docker compose pull` và `docker compose up --no-build`; không build source production.
- Tag ECR `production` chỉ được cập nhật sau khi VPS deploy và healthcheck thành công.
- ECR chỉ lưu application image. Postgres, Payload media, runtime JSON và Uptime Kuma phải backup riêng.
- Rollback image và rollback dữ liệu là hai thao tác khác nhau. Chỉ restore dữ liệu khi migration hoặc dữ liệu đã bị thay đổi.

## Luồng CI/CD production

1. Push/merge vào `main` chạy lint và test.
2. GitHub Actions build target `runner` một lần, gắn tag `${GITHUB_SHA}` và push ECR.
3. VPS đồng bộ checkout `origin/main` để lấy Compose và deployment scripts mới nhất.
4. Trước khi app mới chạy migration, `scripts/backup.sh` tạo snapshot dữ liệu hiện tại.
5. VPS pull đúng image SHA, chạy Compose với `--no-build`, rồi kiểm tra `/api/health`.
6. Nếu healthcheck lỗi, deploy script pull lại previous SHA từ ECR và rollback app image.
7. Nếu thành công, workflow mới promote SHA thành tag `production`.
8. VPS xóa previous app image local và prune các image không dùng. Container đang chạy luôn giữ image hiện tại; ECR vẫn là nguồn rollback.

Production Compose không còn thuộc tính `build:`. Vì vậy lệnh sau trên VPS không thể vô tình build source cũ:

```bash
docker compose build app
```

Khi cần build local có chủ đích:

```bash
docker compose -f docker-compose.yml -f docker-compose.build.yml build app
docker compose -f docker-compose.yml -f docker-compose.build.yml up -d
```

## Dữ liệu nào được backup

Mỗi snapshot trong `backups/YYYYMMDD-HHMMSS/` gồm:

- `payload-postgres.dump`: Postgres custom-format dump.
- `payload-media.tgz`: volume upload của Payload.
- `app-runtime-data.tgz`: comments/newsletter/views JSON fallback trong volume `app_runtime_data`.
- `uptime-kuma-data.tgz`: dữ liệu Uptime Kuma.
- `translation-work.tgz`: translation workspace nếu có.
- `manifest.env`: image SHA và Git commit tương ứng.
- `SHA256SUMS`: checksum để kiểm tra file backup.

Redis không nằm trong backup vì chỉ giữ cache và có thể tái tạo. TLS certificates và `.env` phải được backup riêng trong secret store có mã hóa.

Chạy backup thủ công:

```bash
cd /path/to/app
BACKUP_REASON=manual sh scripts/backup.sh
```

Khuyến nghị cấu hình S3 offsite trong `.env`:

```bash
BACKUP_ROOT=backups
BACKUP_RETENTION_DAYS=30
BACKUP_S3_URI=s3://linuxunity-production-backups/vps
```

Rollback/deploy thủ công cũng cần `AWS_DEFAULT_REGION`, `AWS_ECR_REGISTRY` và
AWS credentials khả dụng cho AWS CLI trên VPS.

Script upload archive với S3 server-side encryption. Bucket nên bật Versioning, Block Public Access và lifecycle riêng, ví dụ giữ daily 30 ngày, monthly 12 tháng. Không dùng ECR làm nơi lưu data backup.
Uptime Kuma được dừng trong thời gian rất ngắn khi snapshot để file SQLite nhất quán, sau đó script tự khởi động lại service.

Cron backup hằng ngày trên VPS:

```cron
15 2 * * * cd /path/to/app && BACKUP_REASON=daily /bin/sh scripts/backup.sh >> /var/log/linuxunity-backup.log 2>&1
```

Kiểm tra định kỳ:

```bash
sha256sum -c backups/YYYYMMDD-HHMMSS/SHA256SUMS
aws s3 ls s3://linuxunity-production-backups/vps/
```

Ít nhất mỗi quý phải restore thử trên một Compose project/host tách biệt.

## Rollback mức 1: chỉ application image

Dùng khi release lỗi nhưng database migration chưa làm dữ liệu không tương thích. Thao tác này không restore Postgres/media:

```bash
cd /path/to/app
CONFIRM_ROLLBACK=yes bash scripts/rollback.sh image
```

Script đọc `.deploy-state/previous-image`, login ECR, pull lại SHA, chạy app với `--no-build` và healthcheck. Có thể chỉ định SHA rõ ràng:

```bash
CONFIRM_ROLLBACK=yes bash scripts/rollback.sh image \
  ACCOUNT.dkr.ecr.REGION.amazonaws.com/REPOSITORY:GIT_SHA
```

## Rollback mức 2: application và dữ liệu

Dùng khi migration hoặc thao tác release đã thay đổi dữ liệu. Đây là thao tác destructive và gây downtime:

```bash
cd /path/to/app
CONFIRM_ROLLBACK=yes bash scripts/rollback.sh full \
  backups/YYYYMMDD-HHMMSS
```

Trình tự:

1. Đọc image SHA từ `manifest.env` và pull lại từ ECR.
2. Tạo safety backup của trạng thái hiện tại.
3. Dừng Nginx, app và Uptime Kuma để chặn ghi mới.
4. Recreate Postgres database rồi `pg_restore` snapshot.
5. Thay media, runtime data và Uptime Kuma volumes bằng snapshot.
6. Khởi động stack với image tương ứng và kiểm tra trạng thái.

Không rollback data chỉ vì code lỗi; dữ liệu mới được tạo sau thời điểm snapshot sẽ mất. Trước full rollback phải ghi nhận RPO được chấp nhận và thông báo maintenance window.

## Kiểm tra sau deploy hoặc rollback

```bash
docker compose ps
curl -fsS http://127.0.0.1:8080/api/health
curl -I http://127.0.0.1:8080/admin
docker compose logs --since 30m app nginx postgres
```

Xác nhận thêm trong CMS: đăng nhập admin, mở bài mới nhất, kiểm tra media và tạo một draft thử. Với full rollback, đối chiếu timestamp/count dữ liệu với manifest và kỳ vọng RPO.

## ECR retention

- Giữ tag SHA đủ lâu để bao phủ toàn bộ cửa sổ rollback dữ liệu.
- Không xóa image được tham chiếu trong các backup còn retention.
- Tag `production` là release thành công gần nhất, nhưng rollback luôn dùng SHA bất biến.
- Có thể dùng ECR lifecycle để xóa image untagged và SHA quá cũ sau khi retention backup tương ứng đã hết.

Sơ đồ kèm theo:

- `docs/cicd-backup-workflow.drawio` và PNG.
- `docs/rollback-workflow.drawio` và PNG.

# Chuyển nội dung production sang staging

Repository hiện hỗ trợ backup/restore Payload ở cấp database + media. Đây là bản sao toàn bộ dữ liệu Payload, không phải content-only export. Nó có thể bao gồm users, comments, newsletter subscribers, projects và các collection khác. Chỉ dùng khi staging được phép nhận bản sao dữ liệu đó.

Không dùng database URL, password hoặc file `.env` production trong chat, git hoặc command history.

## 1. Export trên production

Chạy trên thư mục Compose production:

```bash
# Create a consistent production backup before transferring content
cd /path/to/production-repository
BACKUP_REASON=staging-content-transfer sh scripts/backup.sh
```

Ghi lại dòng cuối:

    BACKUP_DIR=/absolute/path/to/backups/YYYYMMDD-HHMMSS

Các file cần cho bài viết và media:

    payload-postgres.dump
    payload-media.tgz

`app-runtime-data.tgz` và `uptime-kuma-data.tgz` không cần cho việc chuyển bài viết. Không chuyển `.env` production.

Kiểm tra backup trước khi copy:

```bash
# Verify the database dump and media archive are non-empty before transfer
BACKUP_DIR=/absolute/path/to/backups/YYYYMMDD-HHMMSS
stat -c '%n %s bytes' "$BACKUP_DIR/payload-postgres.dump" "$BACKUP_DIR/payload-media.tgz"
sha256sum "$BACKUP_DIR/payload-postgres.dump" "$BACKUP_DIR/payload-media.tgz"
```

## 2. Copy sang staging

Nếu production là VPS khác, copy qua SSH:

```bash
# Transfer only the selected backup artifacts to the staging VPS
scp "$BACKUP_DIR/payload-postgres.dump" \
    "$BACKUP_DIR/payload-media.tgz" \
    <STAGING_USER>@<STAGING_HOST>:/home/aiwriter/incoming/prod-transfer/
```

Trên staging:

```bash
# Restrict the temporary transfer directory to the staging operator
install -d -m 700 /home/aiwriter/incoming/prod-transfer
chmod 600 /home/aiwriter/incoming/prod-transfer/payload-postgres.dump
chmod 600 /home/aiwriter/incoming/prod-transfer/payload-media.tgz
```

Nếu production và staging cùng VPS, copy local thay vì `scp`:

```bash
# Copy the selected backup artifacts into the isolated staging transfer directory
install -d -m 700 /home/aiwriter/incoming/prod-transfer
cp /path/to/production/backups/YYYYMMDD-HHMMSS/payload-postgres.dump /home/aiwriter/incoming/prod-transfer/
cp /path/to/production/backups/YYYYMMDD-HHMMSS/payload-media.tgz /home/aiwriter/incoming/prod-transfer/
chmod 600 /home/aiwriter/incoming/prod-transfer/payload-*.dump /home/aiwriter/incoming/prod-transfer/payload-*.tgz
```

So sánh SHA-256 với output trên production:

```bash
# Confirm the transferred artifacts match the production checksums
sha256sum /home/aiwriter/incoming/prod-transfer/payload-postgres.dump \
          /home/aiwriter/incoming/prod-transfer/payload-media.tgz
```

## 3. Backup staging trước khi thay thế

Restore sẽ xóa database staging hiện tại. Vì vậy phải tạo safety backup:

```bash
# Create a rollback backup of the current staging data
cd /home/lu-new
BACKUP_REASON=before-prod-content-transfer \
  docker compose -f docker-compose.yml -f docker-compose.build.yml \
  exec -T app true
BACKUP_ROOT=./backups-staging \
  COMPOSE='docker compose -f docker-compose.yml -f docker-compose.build.yml' \
  BACKUP_REASON=before-prod-content-transfer sh scripts/backup.sh
```

Nếu backup staging thất bại, dừng và không restore.

## 4. Restore production database/media vào staging

Lệnh này là destructive đối với staging database và Payload media volume. Không chạy trên production:

```bash
# Restore production Payload data into staging after verifying the target directory
cd /home/lu-new
CONFIRM_RESTORE=yes \
  SKIP_SAFETY_BACKUP=true \
  COMPOSE='docker compose -f docker-compose.yml -f docker-compose.build.yml' \
  sh scripts/restore.sh /home/aiwriter/incoming/prod-transfer
```

`SKIP_SAFETY_BACKUP=true` chỉ dùng vì safety backup đã chạy ở bước trước. Nếu chưa có safety backup thành công, bỏ biến này để script tự tạo backup.

Sau restore, kiểm tra:

```bash
# Verify all staging services and the application health after restore
docker compose -f docker-compose.yml -f docker-compose.build.yml ps
curl -fsS -H 'Host: dev.linuxunity.com' http://127.0.0.1/api/health

docker compose -f docker-compose.yml -f docker-compose.build.yml logs --tail=120 app
```

## 5. Kiểm tra dữ liệu bài viết

Mở:

    http://dev.linuxunity.com/admin

Đăng nhập bằng tài khoản đã tồn tại trong database production, vì restore toàn bộ database sẽ thay thế users staging.

Trong Payload Admin:

1. Mở Collections → Series.
2. Kiểm tra Series và trạng thái `Draft`/`Published`.
3. Mở Collections → Posts.
4. Kiểm tra content, slug, media và chapter order.
5. Giữ nội dung ở `Draft` trong khi chỉnh sửa.
6. Dùng preview đã đăng nhập:

       https://dev.linuxunity.com/vi/series-preview/<series-slug>
       https://dev.linuxunity.com/en/series-preview/<series-slug>

Không chuyển sang `Published` tự động. Người dùng tự chỉnh sửa và tự publish.

## 6. Dữ liệu bị ảnh hưởng

Phương thức hiện tại chuyển:

- Posts
- Series
- Rich-text content
- Media/uploads
- Projects
- Users/admin accounts
- Comments
- Newsletter subscribers
- Các collection khác nằm trong Payload database

Phương thức hiện tại không nên dùng nếu staging không được phép chứa các dữ liệu trên. Đặc biệt, không dùng nếu database production chứa PII hoặc dữ liệu khách hàng cần tách biệt.

Sau khi kiểm tra staging, xóa file transfer tạm:

```bash
# Remove temporary transfer artifacts after the staging verification is complete
rm -f /home/aiwriter/incoming/prod-transfer/payload-postgres.dump \
      /home/aiwriter/incoming/prod-transfer/payload-media.tgz
rmdir /home/aiwriter/incoming/prod-transfer 2>/dev/null || true
```

## Content-only variant

Repository chưa có script content-only export/import cho riêng Posts/Series/Media. Nếu cần giữ users, comments, newsletter và dữ liệu production tách biệt, không dùng `restore.sh`; cần thêm importer riêng qua Payload API/SDK với:

- `status=draft` bắt buộc khi import;
- mapping author/series/media;
- không import users, comments hoặc newsletter;
- dry-run trước khi ghi;
- idempotent theo slug;
- report số bản ghi tạo/cập nhật/bỏ qua;
- rollback riêng cho các bản ghi đã import.

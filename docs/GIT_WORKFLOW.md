# Git Workflow

## Mục tiêu

Tài liệu này mô tả cách sử dụng Git branch cho dự án website/blog.

Mục tiêu là đảm bảo:

- Code production luôn ổn định.
- Tính năng mới được phát triển riêng.
- Sửa lỗi có quy trình rõ ràng.
- Tránh push trực tiếp code chưa kiểm tra lên production.
- CI/CD chỉ deploy khi code đã vào branch `main`.

## Các branch chính

### `main`

`main` là branch production.

Quy định:

- Chỉ chứa code đã test ổn định.
- Code trên `main` sẽ được deploy lên VPS.
- Không code trực tiếp trên `main`.
- Nên merge vào `main` thông qua Pull Request từ `develop` hoặc `hotfix/*`.

### `develop`

`develop` là branch tích hợp/test.

Quy định:

- Dùng để gom các tính năng đã hoàn thành.
- Dùng để test trước khi đưa lên production.
- Không deploy production trực tiếp từ `develop`.

### `feature/*`

Dùng để phát triển tính năng mới.

Ví dụ:

```bash
feature/add-blog-search
feature/update-homepage-ui
feature/add-seo-meta
```

Luồng làm việc:

```bash
git switch develop
git pull origin develop
git switch -c feature/add-blog-search
```

Sau khi làm xong:

```bash
git add .
git commit -m "Add blog search feature"
git push -u origin feature/add-blog-search
```

Sau đó tạo Pull Request:

```text
feature/add-blog-search → develop
```

### `bugfix/*`

Dùng để sửa lỗi thông thường chưa quá khẩn cấp.

Ví dụ:

```bash
bugfix/fix-mobile-menu
bugfix/fix-login-error
bugfix/fix-layout-header
```

Luồng làm việc:

```bash
git switch develop
git pull origin develop
git switch -c bugfix/fix-mobile-menu
```

Sau khi sửa xong, tạo Pull Request:

```text
bugfix/fix-mobile-menu → develop
```

### `hotfix/*`

Dùng cho lỗi production khẩn cấp.

Ví dụ:

```bash
hotfix/fix-production-500-error
hotfix/fix-critical-login
```

Luồng làm việc:

```bash
git switch main
git pull origin main
git switch -c hotfix/fix-production-500-error
```

Sau khi sửa xong:

```bash
git add .
git commit -m "Fix production 500 error"
git push -u origin hotfix/fix-production-500-error
```

Tạo Pull Request:

```text
hotfix/fix-production-500-error → main
```

Sau khi merge vào `main`, cần merge ngược lại vào `develop`:

```bash
git switch develop
git pull origin develop
git merge main
git push origin develop
```

## Luồng chuẩn đề xuất

```text
feature/* hoặc bugfix/*
        ↓
     develop
        ↓
      main
        ↓
  CI/CD deploy VPS
```

## Quy tắc commit message

Nên dùng format rõ ràng:

```text
Add ...
Fix ...
Update ...
Refactor ...
Remove ...
Docs ...
```

Ví dụ:

```bash
git commit -m "Add blog search feature"
git commit -m "Fix mobile menu layout"
git commit -m "Update deployment documentation"
git commit -m "Docs add Git workflow guide"
```

## Quy tắc quan trọng

Không push trực tiếp lên `main` nếu chưa cần thiết.

Không commit các file sau:

```text
.env
.env.*
*.log
node_modules/
vendor/
dist/
build/
backup/
backups/
*.sql
*.sqlite
uploads/
cache/
```

Nếu cần file mẫu biến môi trường, dùng:

```text
.env.example
```

## Kiểm tra branch hiện tại

```bash
git branch
```

## Chuyển branch

```bash
git switch ten-branch
```

## Tạo branch mới

```bash
git switch -c feature/ten-tinh-nang
```

## Pull code mới nhất

```bash
git pull origin ten-branch
```

## Push branch mới

```bash
git push -u origin ten-branch
```

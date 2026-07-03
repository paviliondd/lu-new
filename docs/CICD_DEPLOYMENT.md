# CI/CD Deployment

Tai lieu nay mo ta cach deploy website `tesst.linuxunity.com` len VPS bang
GitHub Actions, Docker Compose va Nginx host.

## Tong quan

```text
Developer
  -> git push main
  -> GitHub Actions lint/build
  -> build va push Docker image len AWS ECR
  -> SSH vao VPS
  -> cd /home/lu-new
  -> bash scripts/deploy.sh
  -> docker compose up -d
  -> Nginx host proxy tesst.linuxunity.com -> 127.0.0.1:8080
```

Thu muc production tren VPS:

```text
/home/lu-new
```

Domain production:

```text
tesst.linuxunity.com
```

## Kien truc VPS

Docker Compose chay cac service:

- `nginx`: reverse proxy noi bo trong Docker, bind `127.0.0.1:8080`.
- `app`: Next.js frontend.
- `wordpress`: WordPress admin va REST API.
- `db`: MariaDB noi bo.
- `uptime-kuma`: Uptime Kuma noi bo, route qua Docker nginx.
- `wpcli`: profile tools, chi chay khi can quan tri WordPress.

Nginx cai tren VPS host se nhan traffic public port `80/443` va proxy vao:

```text
http://127.0.0.1:8080
```

MariaDB khong expose public port.

## GitHub Secrets

Tao cac secret trong:

```text
GitHub Repository -> Settings -> Secrets and variables -> Actions
```

Can co:

```text
VPS_HOST=<public-ip-or-hostname>
VPS_PORT=22
VPS_USER=<ssh-user>
VPS_SSH_KEY=<private-ssh-key-for-deploy>
APP_DIR=/home/lu-new
AWS_ACCESS_KEY_ID=<aws-access-key-id>
AWS_SECRET_ACCESS_KEY=<aws-secret-access-key>
AWS_DEFAULT_REGION=ap-southeast-1
AWS_ECR_REGISTRY=123456789012.dkr.ecr.ap-southeast-1.amazonaws.com
AWS_ECR_REPOSITORY=cloud-devops-blog
```

Khong dua `.env` production vao GitHub. File `.env` nam truc tiep tren VPS.

## Chuan bi VPS lan dau

Install packages:

```bash
sudo apt update
sudo apt install -y git nginx ca-certificates curl unzip
```

Install Docker Engine va Docker Compose v2 theo tai lieu Docker chinh thuc.
Kiem tra:

```bash
docker --version
docker compose version
```

Clone source vao dung thu muc production:

```bash
sudo mkdir -p /home/lu-new
sudo chown "$USER:$USER" /home/lu-new
git clone git@github.com:paviliondd/lu-new.git /home/lu-new
cd /home/lu-new
```

Tao `.env` production:

```bash
cp .env.example .env
nano .env
```

Gia tri quan trong:

```text
SITE_DOMAIN=tesst.linuxunity.com
SITE_WWW_DOMAIN=www.tesst.linuxunity.com
NEXT_PUBLIC_SITE_URL=https://tesst.linuxunity.com
WORDPRESS_SITE_URL=https://tesst.linuxunity.com
NEXT_PUBLIC_WORDPRESS_PUBLIC_URL=https://tesst.linuxunity.com
WORDPRESS_API_BASE=http://wordpress?rest_route=/wp/v2
APP_IMAGE=<aws-ecr-registry>/cloud-devops-blog:production
```

Doi toan bo password placeholder trong `.env`.

## DNS

Tao DNS record:

```text
A tesst.linuxunity.com -> <VPS_PUBLIC_IP>
A www.tesst.linuxunity.com -> <VPS_PUBLIC_IP>
```

Kiem tra tren VPS hoac may local:

```bash
dig +short tesst.linuxunity.com
dig +short www.tesst.linuxunity.com
```

Ket qua phai tro ve IP cua VPS.

## Nginx Host Vhost

Tao file:

```bash
sudo nano /etc/nginx/sites-available/tesst.linuxunity.com
```

Noi dung HTTP ban dau:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name tesst.linuxunity.com www.tesst.linuxunity.com;

    client_max_body_size 64m;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Enable vhost:

```bash
sudo ln -s /etc/nginx/sites-available/tesst.linuxunity.com /etc/nginx/sites-enabled/tesst.linuxunity.com
sudo nginx -t
sudo systemctl reload nginx
```

Neu domain van vao trang default cua Nginx, tat default site:

```bash
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

## HTTPS voi Certbot

Sau khi HTTP domain da vao dung app:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tesst.linuxunity.com -d www.tesst.linuxunity.com
```

Kiem tra auto-renew:

```bash
sudo certbot renew --dry-run
```

## Start Lan Dau

Dang nhap ECR tren VPS:

```bash
aws ecr get-login-password --region "$AWS_DEFAULT_REGION" \
  | docker login --username AWS --password-stdin "$AWS_ECR_REGISTRY"
```

Start stack:

```bash
cd /home/lu-new
docker compose config
docker compose pull
docker compose up -d
docker compose ps
docker compose logs -f nginx app wordpress db
```

Kiem tra noi bo:

```bash
curl -I http://127.0.0.1:8080
curl -fsS http://127.0.0.1:8080/api/health
```

Kiem tra domain:

```bash
curl -I http://tesst.linuxunity.com
curl -fsS https://tesst.linuxunity.com/api/health
curl -I https://tesst.linuxunity.com/wp-admin
```

## Deploy Qua GitHub Actions

Workflow:

```text
.github/workflows/deploy-production.yml
```

Khi push vao `main`, workflow se:

1. Checkout source.
2. Cai Node.js 24.
3. Chay `npm ci`.
4. Chay `npm run lint`.
5. Chay `npm run build`.
6. Dang nhap AWS ECR.
7. Build Docker image.
8. Push image tags `production` va commit SHA.
9. SSH vao VPS.
10. `cd /home/lu-new`.
11. Chay `bash scripts/deploy.sh`.

Deploy thu cong tren VPS:

```bash
cd /home/lu-new
bash scripts/deploy.sh
```

## Lenh Van Hanh

Status:

```bash
cd /home/lu-new
docker compose ps
```

Logs:

```bash
docker compose logs -f
docker compose logs -f nginx app wordpress db
```

Restart:

```bash
docker compose up -d --remove-orphans
sudo nginx -t
sudo systemctl reload nginx
```

Backup:

```bash
cd /home/lu-new
scripts/backup.sh
```

## Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

Khong mo port MySQL/MariaDB public.

## Troubleshooting Domain Chi Vao Duoc Bang IP

1. Kiem tra DNS:

   ```bash
   dig +short tesst.linuxunity.com
   ```

2. Kiem tra vhost co enable khong:

   ```bash
   ls -l /etc/nginx/sites-enabled/
   sudo nginx -T | grep -n "tesst.linuxunity.com"
   ```

3. Kiem tra Docker nginx noi bo:

   ```bash
   curl -I http://127.0.0.1:8080
   ```

4. Kiem tra Nginx host proxy:

   ```bash
   curl -H "Host: tesst.linuxunity.com" -I http://127.0.0.1
   ```

5. Xem log:

   ```bash
   sudo tail -n 100 /var/log/nginx/error.log
   sudo tail -n 100 /var/log/nginx/access.log
   cd /home/lu-new && docker compose logs --tail=100 nginx app wordpress
   ```

## Checklist Sau Deploy

- `https://tesst.linuxunity.com` hien thi frontend.
- `https://tesst.linuxunity.com/api/health` tra ve OK.
- `https://tesst.linuxunity.com/wp-admin` vao duoc WordPress admin.
- `https://tesst.linuxunity.com/?rest_route=/wp/v2/posts` tra ve REST API.
- `docker compose ps` khong co service restart loop.
- `sudo nginx -t` pass.

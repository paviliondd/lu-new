#!/bin/sh
set -eu

DOMAIN="${SITE_DOMAIN:-tesst.linuxunity.com}"
WWW_DOMAIN="${SITE_WWW_DOMAIN:-www.${DOMAIN}}"
KUMA_DOMAIN="${KUMA_DOMAIN:-kuma.linuxunity.com}"
TEMPLATE="/etc/nginx/templates/default.conf.template"
TARGET="/etc/nginx/conf.d/default.conf"
CERT_FILE="/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"
CERT_KEY="/etc/letsencrypt/live/${DOMAIN}/privkey.pem"
KUMA_CERT_FILE="/etc/letsencrypt/live/${KUMA_DOMAIN}/fullchain.pem"
KUMA_CERT_KEY="/etc/letsencrypt/live/${KUMA_DOMAIN}/privkey.pem"

export DOMAIN WWW_DOMAIN KUMA_DOMAIN CERT_FILE CERT_KEY KUMA_CERT_FILE KUMA_CERT_KEY

envsubst '${DOMAIN} ${WWW_DOMAIN} ${KUMA_DOMAIN} ${CERT_FILE} ${CERT_KEY} ${KUMA_CERT_FILE} ${KUMA_CERT_KEY}' < "$TEMPLATE" > "$TARGET"

if [ -f "$CERT_FILE" ] && [ -f "$CERT_KEY" ]; then
  cat >> "$TARGET" <<EOF

server {
    listen 443 ssl http2;
    server_name ${DOMAIN} ${WWW_DOMAIN};

    ssl_certificate ${CERT_FILE};
    ssl_certificate_key ${CERT_KEY};
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_protocols TLSv1.2 TLSv1.3;

    client_max_body_size 64m;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript application/xml image/svg+xml;

    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location = /wp-admin {
        return 308 /wp-admin/;
    }

    location / {
        resolver 127.0.0.11 ipv6=off valid=30s;

        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection \$connection_upgrade;

        proxy_pass \$proxy_target;
    }
}
EOF
else
  echo "No TLS certificate found for ${DOMAIN}; starting HTTP-only mode." >&2
fi

if [ -f "$KUMA_CERT_FILE" ] && [ -f "$KUMA_CERT_KEY" ]; then
  cat >> "$TARGET" <<EOF

server {
    listen 443 ssl http2;
    server_name ${KUMA_DOMAIN};

    ssl_certificate ${KUMA_CERT_FILE};
    ssl_certificate_key ${KUMA_CERT_KEY};
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_protocols TLSv1.2 TLSv1.3;

    client_max_body_size 64m;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript application/xml image/svg+xml;

    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location / {
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection \$connection_upgrade;

        proxy_pass http://uptime-kuma:3001;
    }
}
EOF
else
  echo "No TLS certificate found for ${KUMA_DOMAIN}; Kuma remains HTTP-only." >&2
fi

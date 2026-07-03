#!/usr/bin/env sh
set -eu

COMPOSE="${COMPOSE:-docker compose}"
DOMAIN="${SITE_DOMAIN:-tesst.linuxunity.com}"
KUMA_DOMAIN="${KUMA_DOMAIN:-kuma.linuxunity.com}"

section() {
  printf '\n== %s ==\n' "$1"
}

run() {
  printf '+ %s\n' "$*"
  sh -c "$*" || true
}

section "Docker Compose"
run "$COMPOSE ps"

section "Container Nginx"
run "$COMPOSE exec -T nginx nginx -t"
run "$COMPOSE exec -T nginx wget -qO- http://127.0.0.1/api/health"

section "Host HTTP checks"
run "curl -I --max-time 5 http://127.0.0.1 || true"
run "curl -I --max-time 5 http://127.0.0.1:8080 || true"
run "curl -I --max-time 10 http://$DOMAIN || true"
run "curl -I --max-time 10 https://$DOMAIN || true"

section "DNS"
if command -v dig >/dev/null 2>&1; then
  run "dig +short $DOMAIN"
  run "dig +short www.$DOMAIN"
  run "dig +short $KUMA_DOMAIN"
else
  run "getent hosts $DOMAIN"
  run "getent hosts www.$DOMAIN"
  run "getent hosts $KUMA_DOMAIN"
fi

section "WordPress options"
run "$COMPOSE --profile tools run --rm -T wpcli option get siteurl"
run "$COMPOSE --profile tools run --rm -T wpcli option get home"
run "$COMPOSE --profile tools run --rm -T wpcli rewrite structure"

section "WordPress REST"
run "$COMPOSE exec -T app wget -qO- 'http://wordpress?rest_route=/wp/v2/posts&per_page=1'"
run "$COMPOSE exec -T app wget -qO- 'http://wordpress?rest_route=/linuxunity/v1/posts/non-existent/view' --post-data=''"

section "Summary hints"
cat <<EOF
- If 127.0.0.1:8080 works but $DOMAIN fails, check VPS firewall/provider security rules and NGINX_HTTP_BIND.
- If nginx -t fails, inspect deploy/nginx/default.conf and recreate nginx.
- If WordPress REST fails from app, check wordpress container health and WORDPRESS_API_BASE.
- If HTTPS fails but HTTP works, configure TLS termination separately or mount certificates into the nginx container.
EOF

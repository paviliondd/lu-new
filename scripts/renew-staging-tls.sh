#!/bin/sh
set -eu

cd /home/lu-new
docker compose -f docker-compose.yml -f docker-compose.build.yml --profile tools run --rm certbot renew --quiet
docker compose -f docker-compose.yml -f docker-compose.build.yml restart nginx

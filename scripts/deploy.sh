#!/usr/bin/env bash
set -euo pipefail

DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"

log() {
  printf '[deploy] %s\n' "$*"
}

fail() {
  printf '[deploy] ERROR: %s\n' "$*" >&2
  exit 1
}

if [ -n "${APP_DIR:-}" ]; then
  log "Changing directory to APP_DIR=${APP_DIR}"
  cd "${APP_DIR}"
fi

log "Working directory: $(pwd)"

[ -d ".git" ] || fail "Current directory is not a Git repository."
[ -f "docker-compose.yml" ] || fail "docker-compose.yml not found."
[ -f ".env" ] || fail ".env not found. Create it from .env.example on the VPS before deploying."

command -v git >/dev/null 2>&1 || fail "git is not installed."
command -v docker >/dev/null 2>&1 || fail "docker is not installed."
docker compose version >/dev/null 2>&1 || fail "Docker Compose v2 is not available."

log "Fetching origin/${DEPLOY_BRANCH}"
git fetch origin "${DEPLOY_BRANCH}"

log "Resetting code to origin/${DEPLOY_BRANCH}"
git reset --hard "origin/${DEPLOY_BRANCH}"

log "Validating Docker Compose configuration"
docker compose config >/dev/null

log "Building and starting production containers"
docker compose up -d --build --remove-orphans

log "Current service status"
docker compose ps

log "Recent logs"
docker compose logs --tail=80 caddy app wordpress db || true

log "Deployment completed"

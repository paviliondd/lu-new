#!/usr/bin/env bash
set -euo pipefail

DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"
DEPLOY_IMAGE_SOURCE="${DEPLOY_IMAGE_SOURCE:-build}"

log() {
  printf '[deploy] %s\n' "$*"
}

fail() {
  printf '[deploy] ERROR: %s\n' "$*" >&2
  exit 1
}

load_env_file() {
  local file="$1"

  while IFS= read -r line || [ -n "$line" ]; do
    line="${line%$'\r'}"

    case "$line" in
      ""|\#*) continue ;;
    esac

    if [[ "$line" != *=* ]]; then
      continue
    fi

    local key="${line%%=*}"
    local value="${line#*=}"

    if [[ "$key" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]] && [ -z "${!key:-}" ]; then
      export "$key=$value"
    fi
  done < "$file"
}

sanitize_var() {
  local key="$1"
  local value="${!key:-}"

  value="$(printf '%s' "$value" | tr -d '\r\n')"

  case "$key" in
    AWS_ECR_REGISTRY)
      value="${value%/}"
      ;;
    AWS_ECR_REPOSITORY)
      value="${value#/}"
      value="${value%/}"
      ;;
  esac

  export "$key=$value"
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

load_env_file ".env"
sanitize_var APP_IMAGE

if [ -n "${AWS_ECR_REGISTRY:-}" ]; then
  sanitize_var AWS_DEFAULT_REGION
  sanitize_var AWS_ECR_REGISTRY
  command -v aws >/dev/null 2>&1 || fail "aws CLI is required to pull from AWS ECR."
  [ -n "${AWS_DEFAULT_REGION:-}" ] || fail "AWS_DEFAULT_REGION is required for AWS ECR login."

  log "Logging Docker into AWS ECR registry ${AWS_ECR_REGISTRY}"
  aws ecr get-login-password --region "${AWS_DEFAULT_REGION}" |
    docker login --username AWS --password-stdin "${AWS_ECR_REGISTRY}"
fi

log "Validating Docker Compose configuration"
docker compose config >/dev/null

log "Pulling external images"
docker compose pull --ignore-buildable

case "${DEPLOY_IMAGE_SOURCE}" in
  registry)
    [ -n "${APP_IMAGE:-}" ] || fail "APP_IMAGE is required when DEPLOY_IMAGE_SOURCE=registry."
    log "Pulling application image ${APP_IMAGE}"
    docker compose pull app
    ;;
  build)
    log "Building app image from the checked-out source"
    docker compose build app
    ;;
  *)
    fail "DEPLOY_IMAGE_SOURCE must be either 'registry' or 'build'."
    ;;
esac

log "Starting production containers"
if [ "${DEPLOY_IMAGE_SOURCE}" = "registry" ]; then
  docker compose up -d --remove-orphans --no-build
else
  docker compose up -d --remove-orphans
fi

log "Waiting for app healthcheck"
for attempt in $(seq 1 60); do
  if docker compose exec -T app sh -lc 'wget -qO- http://127.0.0.1:3000/api/health >/dev/null'; then
    break
  fi

  if [ "$attempt" -eq 60 ]; then
    fail "App did not become healthy after 120 seconds."
  fi

  sleep 2
done

log "Repairing Payload posts and clearing content cache"
docker compose exec -T app npm run payload:repair-posts

log "Current service status"
docker compose ps

log "Recent logs"
docker compose logs --tail=80 nginx app postgres uptime-kuma || true

log "Deployment completed"

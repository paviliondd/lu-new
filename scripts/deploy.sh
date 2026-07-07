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

log "Building app image"
docker compose build app

log "Starting production containers"
docker compose up -d --remove-orphans

log "Current service status"
docker compose ps

log "Recent logs"
docker compose logs --tail=80 nginx app postgres uptime-kuma || true

log "Deployment completed"

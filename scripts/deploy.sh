#!/usr/bin/env bash
set -euo pipefail

DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"
DEPLOY_SKIP_GIT_SYNC="${DEPLOY_SKIP_GIT_SYNC:-false}"
DEPLOY_ROLLBACK_IMAGE="${DEPLOY_ROLLBACK_IMAGE:-}"
DEPLOY_CREATE_BACKUP="${DEPLOY_CREATE_BACKUP:-true}"
DEPLOY_PRUNE_IMAGES="${DEPLOY_PRUNE_IMAGES:-true}"
IMAGE_PRUNE_UNTIL="${IMAGE_PRUNE_UNTIL:-168h}"
STATE_DIR="${DEPLOY_STATE_DIR:-.deploy-state}"
PULL_RETRY_ATTEMPTS="${DEPLOY_PULL_RETRY_ATTEMPTS:-4}"
PULL_RETRY_DELAY="${DEPLOY_PULL_RETRY_DELAY:-15}"

log() { printf '[deploy] %s\n' "$*"; }
fail() { printf '[deploy] ERROR: %s\n' "$*" >&2; exit 1; }

retry_ecr_login() {
  for attempt in $(seq 1 "$PULL_RETRY_ATTEMPTS"); do
    if aws ecr get-login-password --region "$AWS_DEFAULT_REGION" | docker login --username AWS --password-stdin "$AWS_ECR_REGISTRY"; then
      return 0
    fi

    if [ "$attempt" -eq "$PULL_RETRY_ATTEMPTS" ]; then
      fail "Failed to log Docker into ECR registry ${AWS_ECR_REGISTRY} after ${PULL_RETRY_ATTEMPTS} attempts."
    fi

    log "Docker login to ECR failed; retrying in ${PULL_RETRY_DELAY}s (${attempt}/${PULL_RETRY_ATTEMPTS})"
    sleep "$PULL_RETRY_DELAY"
  done
}

retry_docker_compose_pull() {
  local description="$1"
  shift

  for attempt in $(seq 1 "$PULL_RETRY_ATTEMPTS"); do
    if docker compose pull "$@"; then
      return 0
    fi

    if [ "$attempt" -eq "$PULL_RETRY_ATTEMPTS" ]; then
      fail "Failed to pull ${description} after ${PULL_RETRY_ATTEMPTS} attempts."
    fi

    log "Pull failed for ${description}; retrying in ${PULL_RETRY_DELAY}s (${attempt}/${PULL_RETRY_ATTEMPTS})"
    sleep "$PULL_RETRY_DELAY"
  done
}

load_env_file() {
  local file="$1" line key value
  while IFS= read -r line || [ -n "$line" ]; do
    line="${line%$'\r'}"
    case "$line" in ""|\#*) continue ;; esac
    [[ "$line" == *=* ]] || continue
    key="${line%%=*}"
    value="${line#*=}"
    if [[ "$key" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]] && [ -z "${!key:-}" ]; then
      export "$key=$value"
    fi
  done < "$file"
}

sanitize_var() {
  local key="$1" value="${!1:-}"
  value="$(printf '%s' "$value" | tr -d '\r\n')"
  case "$key" in
    AWS_ECR_REGISTRY) value="${value%/}" ;;
    AWS_ECR_REPOSITORY) value="${value#/}"; value="${value%/}" ;;
  esac
  export "$key=$value"
}

rollback_app() {
  local failed_image="${APP_IMAGE:-}"
  [ -n "$DEPLOY_ROLLBACK_IMAGE" ] || return 1
  [ "$DEPLOY_ROLLBACK_IMAGE" != "$failed_image" ] || return 1
  log "Rolling application image back to ${DEPLOY_ROLLBACK_IMAGE}"
  export APP_IMAGE="$DEPLOY_ROLLBACK_IMAGE"
  retry_docker_compose_pull "rollback app image ${DEPLOY_ROLLBACK_IMAGE}" app
  docker compose up -d --no-deps --no-build app
  printf '%s\n' "$DEPLOY_ROLLBACK_IMAGE" > "${STATE_DIR}/current-image"
  printf '%s\n' "$failed_image" > "${STATE_DIR}/failed-image"
}

[ -n "${APP_DIR:-}" ] && cd "$APP_DIR"
log "Working directory: $(pwd)"

[ -d .git ] || fail "Current directory is not a Git repository."
[ -f docker-compose.yml ] || fail "docker-compose.yml not found."
[ -f .env ] || fail ".env not found."
command -v git >/dev/null 2>&1 || fail "git is not installed."
command -v docker >/dev/null 2>&1 || fail "docker is not installed."
docker compose version >/dev/null 2>&1 || fail "Docker Compose v2 is not available."

if [ "$DEPLOY_SKIP_GIT_SYNC" = true ]; then
  log "Using checkout synchronized by the deployment caller"
else
  log "Synchronizing origin/${DEPLOY_BRANCH}"
  git fetch origin "$DEPLOY_BRANCH"
  git reset --hard "origin/${DEPLOY_BRANCH}"
fi

load_env_file .env
sanitize_var APP_IMAGE
[ -n "${APP_IMAGE:-}" ] || fail "APP_IMAGE must be an immutable ECR tag."
case "$APP_IMAGE" in *:production|*:latest) fail "APP_IMAGE must use an immutable Git SHA tag, not ${APP_IMAGE##*:}." ;; esac

sanitize_var AWS_DEFAULT_REGION
sanitize_var AWS_ECR_REGISTRY
sanitize_var AWS_ECR_REPOSITORY
[ -n "${AWS_ECR_REGISTRY:-}" ] || fail "AWS_ECR_REGISTRY is required."
[ -n "${AWS_DEFAULT_REGION:-}" ] || fail "AWS_DEFAULT_REGION is required."
command -v aws >/dev/null 2>&1 || fail "aws CLI is required for ECR deployment."

mkdir -p "$STATE_DIR"
CURRENT_CONTAINER="$(docker compose ps -q app 2>/dev/null || true)"
if [ -z "$DEPLOY_ROLLBACK_IMAGE" ] && [ -n "$CURRENT_CONTAINER" ]; then
  DEPLOY_ROLLBACK_IMAGE="$(docker inspect --format '{{.Config.Image}}' "$CURRENT_CONTAINER" 2>/dev/null || true)"
fi

if [ "$DEPLOY_CREATE_BACKUP" = true ] && [ -n "$CURRENT_CONTAINER" ]; then
  log "Creating pre-deploy data backup before Payload migrations"
  BACKUP_REASON=pre-deploy sh scripts/backup.sh
fi

log "Logging Docker into ${AWS_ECR_REGISTRY}"
retry_ecr_login

log "Validating Compose and pulling immutable image ${APP_IMAGE}"
docker compose config >/dev/null
retry_docker_compose_pull "Compose images" --ignore-buildable
retry_docker_compose_pull "app image ${APP_IMAGE}" app

log "Starting production containers without a VPS source build"
docker compose up -d --remove-orphans --no-build

log "Waiting for application health"
for attempt in $(seq 1 60); do
  if docker compose exec -T app sh -lc 'wget -qO- http://127.0.0.1:3000/api/health >/dev/null'; then
    break
  fi
  if [ "$attempt" -eq 60 ]; then
    rollback_app || true
    fail "Healthcheck failed; image rollback was attempted. Use the pre-deploy backup for data rollback if migrations changed data."
  fi
  sleep 2
done

log "Repairing Payload posts and clearing content cache"
if ! docker compose exec -T app npm run payload:repair-posts; then
  rollback_app || true
  fail "Post-deploy repair failed; image rollback was attempted."
fi

printf '%s\n' "$APP_IMAGE" > "${STATE_DIR}/current-image"
printf '%s\n' "$DEPLOY_ROLLBACK_IMAGE" > "${STATE_DIR}/previous-image"
printf '%s\n' "$(git rev-parse HEAD)" > "${STATE_DIR}/current-git-commit"

if [ "$DEPLOY_PRUNE_IMAGES" = true ]; then
  if [ -n "$DEPLOY_ROLLBACK_IMAGE" ] && [ "$DEPLOY_ROLLBACK_IMAGE" != "$APP_IMAGE" ]; then
    log "Removing previous local app image; ECR remains the rollback source"
    docker image rm "$DEPLOY_ROLLBACK_IMAGE" >/dev/null 2>&1 || true
  fi
  log "Pruning unused local images older than ${IMAGE_PRUNE_UNTIL}"
  docker image prune -af --filter "until=${IMAGE_PRUNE_UNTIL}" >/dev/null
fi

docker compose ps
docker compose logs --tail=80 nginx app postgres uptime-kuma || true
log "Deployment completed"

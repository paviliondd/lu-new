#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-image}"
ARG="${2:-}"
STATE_DIR="${DEPLOY_STATE_DIR:-.deploy-state}"

if [ "${CONFIRM_ROLLBACK:-}" != yes ]; then
  echo "Usage:" >&2
  echo "  CONFIRM_ROLLBACK=yes scripts/rollback.sh image [ECR_IMAGE_SHA_TAG]" >&2
  echo "  CONFIRM_ROLLBACK=yes scripts/rollback.sh full BACKUP_DIR" >&2
  exit 1
fi

[ -f .env ] || { echo ".env not found" >&2; exit 1; }
set -a
# shellcheck disable=SC1091
. ./.env
set +a

rollback_image() {
  local target="${1:-}"
  if [ -z "$target" ] && [ -f "${STATE_DIR}/previous-image" ]; then
    target="$(cat "${STATE_DIR}/previous-image")"
  fi
  [ -n "$target" ] || { echo "No rollback image supplied or recorded." >&2; exit 1; }
  case "$target" in *:production|*:latest) echo "Rollback requires an immutable SHA tag." >&2; exit 1 ;; esac

  local current="$(docker inspect --format '{{.Config.Image}}' "$(docker compose ps -q app)" 2>/dev/null || true)"
  export APP_IMAGE="$target"
  aws ecr get-login-password --region "$AWS_DEFAULT_REGION" | docker login --username AWS --password-stdin "$AWS_ECR_REGISTRY"
  docker compose pull app
  docker compose up -d --no-deps --no-build app

  for attempt in $(seq 1 60); do
    docker compose exec -T app sh -lc 'wget -qO- http://127.0.0.1:3000/api/health >/dev/null' && break
    [ "$attempt" -lt 60 ] || { echo "Rollback image failed healthcheck." >&2; exit 1; }
    sleep 2
  done

  mkdir -p "$STATE_DIR"
  printf '%s\n' "$target" > "${STATE_DIR}/current-image"
  printf '%s\n' "$current" > "${STATE_DIR}/previous-image"
  echo "Application rolled back to ${target}. Data was not changed."
}

case "$MODE" in
  image)
    rollback_image "$ARG"
    ;;
  full)
    [ -n "$ARG" ] || { echo "BACKUP_DIR is required for full rollback." >&2; exit 1; }
    TARGET_IMAGE="$(sed -n 's/^APP_IMAGE=//p' "${ARG}/manifest.env" 2>/dev/null || true)"
    [ -n "$TARGET_IMAGE" ] || { echo "Backup manifest has no APP_IMAGE." >&2; exit 1; }
    export APP_IMAGE="$TARGET_IMAGE"
    aws ecr get-login-password --region "$AWS_DEFAULT_REGION" | docker login --username AWS --password-stdin "$AWS_ECR_REGISTRY"
    docker compose pull app
    CONFIRM_RESTORE=yes sh scripts/restore.sh "$ARG"
    mkdir -p "$STATE_DIR"
    printf '%s\n' "$TARGET_IMAGE" > "${STATE_DIR}/current-image"
    echo "Application and persistent data rolled back from ${ARG}."
    ;;
  *)
    echo "Unknown rollback mode: ${MODE}" >&2
    exit 1
    ;;
esac

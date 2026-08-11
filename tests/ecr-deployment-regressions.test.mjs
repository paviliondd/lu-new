import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("production deploys an immutable ECR image and promotes only after SSH succeeds", async () => {
  const workflow = await readFile(".github/workflows/deploy-production.yml", "utf8");
  const deployIndex = workflow.indexOf("name: Deploy over SSH");
  const promoteIndex = workflow.indexOf("name: Promote successfully deployed image");

  assert.match(workflow, /--tag "\$\{IMAGE\}:\$\{GITHUB_SHA\}"/);
  assert.match(workflow, /APP_IMAGE="\$\{AWS_ECR_REGISTRY\}\/\$\{AWS_ECR_REPOSITORY\}:\$\{\{ github\.sha \}\}"/);
  assert.match(workflow, /DEPLOY_CREATE_BACKUP="true"/);
  assert.match(workflow, /DEPLOY_PRUNE_IMAGES="true"/);
  assert.match(workflow, /--tag "\$\{IMAGE\}:production"/);
  assert.ok(deployIndex >= 0 && promoteIndex > deployIndex);
  assert.match(workflow, /cache-from type=gha,scope=production/);
  assert.match(workflow, /cache-to type=gha,scope=production,mode=min/);
});

test("production Compose cannot rebuild stale VPS source", async () => {
  const compose = await readFile("docker-compose.yml", "utf8");
  const buildOverride = await readFile("docker-compose.build.yml", "utf8");
  const deployScript = await readFile("scripts/deploy.sh", "utf8");

  assert.doesNotMatch(compose, /^\s+build:\s*$/m);
  assert.match(buildOverride, /^\s+build:\s*$/m);
  assert.doesNotMatch(deployScript, /docker compose build app/);
  assert.match(deployScript, /docker compose up -d --remove-orphans --no-build/);
  assert.match(deployScript, /APP_IMAGE must use an immutable Git SHA tag/);
});

test("production image includes Payload config source dependencies", async () => {
  const dockerfile = await readFile("Dockerfile", "utf8");
  const payloadConfig = await readFile("src/payload.config.ts", "utf8");

  assert.match(dockerfile, /\/app\/src\/collections \.\/src\/collections/);
  assert.match(dockerfile, /\/app\/src\/content\/projects \.\/src\/content\/projects/);
  assert.match(dockerfile, /\/app\/src\/payload\.config\.ts \.\/src\/payload\.config\.ts/);
  assert.match(dockerfile, /\/app\/src\/migrations \.\/src\/migrations/);
  assert.match(payloadConfig, /from "\.\/collections\/Projects"/);
  assert.doesNotMatch(payloadConfig, /from "@\/collections\/Projects"/);
});

test("deployment backs up persistent data and records ECR rollback state", async () => {
  const deployScript = await readFile("scripts/deploy.sh", "utf8");
  const backupScript = await readFile("scripts/backup.sh", "utf8");
  const rollbackScript = await readFile("scripts/rollback.sh", "utf8");

  assert.match(deployScript, /BACKUP_REASON=pre-deploy sh scripts\/backup\.sh/);
  assert.match(deployScript, /previous-image/);
  assert.match(deployScript, /docker image rm "\$DEPLOY_ROLLBACK_IMAGE"/);
  assert.match(deployScript, /retry_docker_compose_pull "Compose images" --ignore-buildable/);
  assert.match(deployScript, /retry_docker_compose_pull "app image \$\{APP_IMAGE\}" app/);
  assert.match(backupScript, /payload-postgres\.dump/);
  assert.doesNotMatch(backupScript, /payload-media\.tgz/);
  assert.match(backupScript, /app-runtime-data\.tgz/);
  assert.match(backupScript, /uptime-kuma-data\.tgz/);
  assert.match(backupScript, /aws s3 cp/);
  assert.match(backupScript, /if \[ -n "\$BACKUP_S3_URI" \]/);
  assert.match(backupScript, /keeping this backup on the VPS temporarily/);
  assert.match(rollbackScript, /CONFIRM_ROLLBACK/);
  assert.match(rollbackScript, /scripts\/restore\.sh/);
  assert.match(rollbackScript, /retry_docker_compose_pull "rollback app image \$\{target\}" app/);
  assert.match(rollbackScript, /retry_docker_compose_pull "backup app image \$\{TARGET_IMAGE\}" app/);
});

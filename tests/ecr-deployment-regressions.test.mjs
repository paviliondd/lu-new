import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

test("production publishes immutable and production ECR tags", async () => {
  const workflow = await readFile(".github/workflows/deploy-production.yml", "utf8");

  assert.match(workflow, /if: github\.ref == 'refs\/heads\/main'/);
  assert.doesNotMatch(workflow, /--tag "\$\{IMAGE\}:latest"/);
  assert.match(workflow, /imagetools create/);
  assert.match(workflow, /--tag "\$\{IMAGE\}:production"/);
  assert.match(workflow, /--tag "\$\{IMAGE\}:\$\{GITHUB_SHA\}"/);
  assert.match(
    workflow,
    /APP_IMAGE="\$\{AWS_ECR_REGISTRY\}\/\$\{AWS_ECR_REPOSITORY\}:\$\{\{ github\.sha \}\}"/,
  );
  assert.match(workflow, /DEPLOY_IMAGE_SOURCE="registry"/);
  assert.match(workflow, /git reset --hard origin\/main/);
  assert.match(workflow, /DEPLOY_SKIP_GIT_SYNC="true"/);
  assert.match(workflow, /needs: \[verify, build-and-push\]/);
  assert.match(workflow, /DEPLOY_ROLLBACK_IMAGE/);
  assert.match(workflow, /cache-to type=gha,scope=production,mode=min/);
});

test("registry deployment pulls the verified image without rebuilding it", async () => {
  const deployScript = await readFile("scripts/deploy.sh", "utf8");

  assert.match(deployScript, /DEPLOY_IMAGE_SOURCE="\$\{DEPLOY_IMAGE_SOURCE:-build\}"/);
  assert.match(deployScript, /DEPLOY_SKIP_GIT_SYNC="\$\{DEPLOY_SKIP_GIT_SYNC:-false\}"/);
  assert.match(deployScript, /Using checkout synchronized by the deployment caller/);
  assert.match(deployScript, /docker compose pull app/);
  assert.match(deployScript, /docker compose up -d --remove-orphans --no-build/);
  assert.match(deployScript, /docker compose build app/);
  assert.match(deployScript, /Rolling app back to/);
});

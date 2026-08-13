import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { test } from "node:test";

const execFileAsync = promisify(execFile);

test("server highlighting detects YAML while preserving explicit plaintext", async () => {
  const script = `
    const { highlightCodeBlocks } = await import("./src/lib/content/highlight.ts");
    const yaml = await highlightCodeBlocks(
      "<pre><code>apiVersion: apps/v1\\nkind: Deployment\\nmetadata:\\n  name: web</code></pre>"
    );
    const topology = "    ┌──────┐\\n    │ web  │\\n    └──┬───┘\\n       │\\n    database";
    const plain = await highlightCodeBlocks(
      '<pre><code class="language-plain">' + topology + '</code></pre>'
    );
    const explicitPlain = await highlightCodeBlocks(
      '<pre data-language="plain"><code class="language-javascript">const ready = true;</code></pre>'
    );
    process.stdout.write(JSON.stringify({ yaml, plain, explicitPlain }));
  `;
  const { stdout } = await execFileAsync(
    process.execPath,
    ["--conditions=react-server", "--import", "tsx", "--input-type=module", "--eval", script],
    { cwd: process.cwd() },
  );
  const { yaml, plain, explicitPlain } = JSON.parse(stdout);

  assert.match(yaml, /data-language="yaml"/);
  assert.match(yaml, /shiki-themes github-light dark-plus/);
  assert.doesNotMatch(plain, /data-language=/);
  assert.match(plain, /    ┌──────┐/);
  assert.match(plain, /    database/);
  assert.doesNotMatch(explicitPlain, /data-language=/);
  assert.doesNotMatch(explicitPlain, /#D73A49|#569CD6/);
});

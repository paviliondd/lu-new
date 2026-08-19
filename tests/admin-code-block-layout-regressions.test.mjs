import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Payload Admin code snippets start compact and grow with editor content", async () => {
  const [config, styles] = await Promise.all([
    readFile("src/payload.config.ts", "utf8"),
    readFile("src/app/(payload)/custom-admin.css", "utf8"),
  ]);

  assert.match(config, /name: "code", type: "textarea", required: true, admin: \{ rows: 7 \}/);
  assert.match(styles, /LexicalEditorTheme__block-codeSnippet[\s\S]*?max-width: min\(100%, 52rem\)/);
  assert.match(styles, /LexicalEditorTheme__block-codeSnippet[\s\S]*?field-sizing: content/);
  assert.match(styles, /LexicalEditorTheme__block-codeSnippet[\s\S]*?min-block-size: 7\.5rem/);
  assert.match(styles, /LexicalEditorTheme__block-codeSnippet[\s\S]*?max-block-size: 28rem/);
});

test("Payload Admin editing rhythm uses balanced spacing for code fields", async () => {
  const styles = await readFile("src/app/(payload)/custom-admin.css", "utf8");

  assert.match(styles, /LexicalEditorTheme__block-codeSnippet[\s\S]*?margin: 1rem auto/);
  assert.match(styles, /LexicalEditorTheme__block-codeSnippet[\s\S]*?padding: 0\.75rem/);
  assert.match(styles, /LexicalEditorTheme__block-codeSnippet[\s\S]*?line-height: 1\.55/);
});

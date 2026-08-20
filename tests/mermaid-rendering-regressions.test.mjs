import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Mermaid toolbar keeps zoom controls grouped and centered", async () => {
  const [renderer, styles] = await Promise.all([
    readFile("src/app/components/MermaidRenderer.tsx", "utf8"),
    readFile("src/app/globals.css", "utf8"),
  ]);

  assert.match(renderer, /const zoomControls = document\.createElement\("div"\)/);
  assert.match(renderer, /zoomControls\.className = "mermaid-shell__zoom-controls"/);
  assert.match(renderer, /zoomControls\.append\(zoomOut, zoomIn\)/);
  assert.match(renderer, /toolbar\.append\(label, zoomControls, reset\)/);
  assert.match(styles, /\.mermaid-shell__toolbar\s*\{[\s\S]*display: grid;[\s\S]*grid-template-columns: minmax\(0, 1fr\) auto minmax\(0, 1fr\)/);
  assert.match(styles, /\.mermaid-shell__zoom-controls\s*\{[\s\S]*justify-self: center/);
});

test("Mermaid canvas centers diagrams without removing overflow support", async () => {
  const [renderer, styles] = await Promise.all([
    readFile("src/app/components/MermaidRenderer.tsx", "utf8"),
    readFile("src/app/globals.css", "utf8"),
  ]);

  assert.match(renderer, /const canvas = document\.createElement\("div"\)/);
  assert.match(renderer, /canvas\.className = "mermaid-shell__canvas"/);
  assert.match(renderer, /canvas\.append\(svg\)/);
  assert.match(renderer, /stage\.append\(canvas\)/);
  assert.match(styles, /\.mermaid-shell__stage\s*\{[\s\S]*overflow: auto/);
  assert.match(styles, /\.mermaid-shell__canvas\s*\{[\s\S]*min-width: 100%;[\s\S]*place-items: center/);
  assert.match(styles, /\.mermaid-shell__canvas svg\s*\{[\s\S]*margin-inline: auto;[\s\S]*transform-origin: center center/);
});

import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Window } from "happy-dom";

import CopyCodeButton, {
  resolveCopyState,
} from "../src/app/components/CodeBlock/CopyButton.tsx";
import { copyText } from "../src/app/components/CodeBlock/copyText.ts";
import {
  downloadCode,
  sanitizeFilename,
} from "../src/app/components/CodeBlock/DownloadButton.tsx";

const labels = {
  idle: "Sao chép",
  copying: "Đang sao chép",
  success: "Đã sao chép",
  error: "Không thể sao chép",
  errorHelp: "Không thể truy cập clipboard. Hãy chọn đoạn code và nhấn Ctrl/Cmd+C.",
};

function installDom() {
  const window = new Window({ url: "https://linuxunity.test" });
  const globals = {
    window,
    document: window.document,
    navigator: window.navigator,
    HTMLElement: window.HTMLElement,
    HTMLTextAreaElement: window.HTMLTextAreaElement,
    Node: window.Node,
    Event: window.Event,
    MouseEvent: window.MouseEvent,
  };

  for (const [name, value] of Object.entries(globals)) {
    Object.defineProperty(globalThis, name, {
      configurable: true,
      value,
      writable: true,
    });
  }

  Object.defineProperty(window, "isSecureContext", {
    configurable: true,
    value: true,
  });
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  return window;
}

test("copyText preserves exact code with Clipboard API", async () => {
  const window = installDom();
  const source = "echo \"<LinuxUnity> & tiếng Việt\"\nvalue=$(date)\n";
  let copied = "";

  Object.defineProperty(window.navigator, "clipboard", {
    configurable: true,
    value: {
      async writeText(value) {
        copied = value;
      },
    },
  });

  assert.equal(await copyText(source), true);
  assert.equal(copied, source);
  window.close();
});

test("copyText falls back and restores focus when Clipboard API fails", async () => {
  const window = installDom();
  const trigger = window.document.createElement("button");
  window.document.body.append(trigger);
  trigger.focus();

  Object.defineProperty(window.navigator, "clipboard", {
    configurable: true,
    value: {
      async writeText() {
        throw new Error("denied");
      },
    },
  });
  window.document.execCommand = (command) => command === "copy";

  assert.equal(await copyText("line 1\n\nline 3"), true);
  assert.equal(window.document.activeElement, trigger);
  assert.equal(window.document.querySelector("textarea"), null);
  window.close();
});

test("copyText reports a failed fallback", async () => {
  const window = installDom();
  Object.defineProperty(window.navigator, "clipboard", {
    configurable: true,
    value: undefined,
  });
  window.document.execCommand = () => false;

  assert.equal(await copyText("echo failed"), false);
  window.close();
});

test("CopyCodeButton renders the requested symbol and accessible status markup", () => {
  const html = renderToStaticMarkup(
    React.createElement(CopyCodeButton, {
      code: "printf '%s' \"$HOME\"",
      labels,
    }),
  );

  assert.match(html, /⧉/);
  assert.match(html, /Sao chép/);
  assert.match(html, /aria-describedby=/);
  assert.match(html, /aria-live="polite"/);
});

test("copy state resolves success, false fallback, and thrown errors", async () => {
  assert.equal(await resolveCopyState(async () => true, "ok"), "success");
  assert.equal(await resolveCopyState(() => false, "false"), "error");
  assert.equal(
    await resolveCopyState(() => {
      throw new Error("denied");
    }, "denied"),
    "error",
  );
});

test("downloadCode sanitizes the filename and preserves content", () => {
  const window = installDom();
  const source = "dòng 1\n\n<value>&\n";
  let blob;
  let downloadedAs = "";
  let revokedUrl = "";

  window.URL.createObjectURL = (value) => {
    blob = value;
    return "blob:linuxunity";
  };
  window.URL.revokeObjectURL = (value) => {
    revokedUrl = value;
  };
  window.HTMLAnchorElement.prototype.click = function click() {
    downloadedAs = this.download;
  };

  downloadCode(source, 'inventory<prod>:".ini');

  assert.equal(sanitizeFilename('inventory<prod>:".ini'), "inventory-prod---.ini");
  assert.equal(downloadedAs, "inventory-prod---.ini");
  assert.equal(blob.size, new Blob([source]).size);
  assert.equal(revokedUrl, "blob:linuxunity");
  window.close();
});

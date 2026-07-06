"use client";

import { useEffect } from "react";

interface CodeBlockEnhancerProps {
  containerSelector?: string;
  contentKey: string;
  copyLabel: string;
  copiedLabel: string;
  failedLabel: string;
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    return copied;
  }
}

function getFilename(preElement: HTMLElement, codeElement: HTMLElement) {
  const explicitFilename =
    preElement.dataset.filename ||
    preElement.dataset.file ||
    preElement.dataset.title ||
    codeElement.dataset.filename ||
    codeElement.dataset.file;

  return explicitFilename || "code";
}

export default function CodeBlockEnhancer({
  containerSelector = ".article-content",
  contentKey,
  copyLabel,
  copiedLabel,
  failedLabel,
}: CodeBlockEnhancerProps) {
  useEffect(() => {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const cleanupHandlers: Array<() => void> = [];
    const codeBlocks = Array.from(container.querySelectorAll("pre"));

    codeBlocks.forEach((preElement) => {
      const codeElement = preElement.querySelector("code");
      if (!(preElement instanceof HTMLElement) || !(codeElement instanceof HTMLElement)) {
        return;
      }

      if (preElement.dataset.enhanced === "true") return;
      preElement.dataset.enhanced = "true";
      preElement.classList.add("code-block");

      const rawCode = codeElement.textContent || "";
      const filename = getFilename(preElement, codeElement);

      const shell = document.createElement("div");
      shell.className = "code-shell";

      const header = document.createElement("div");
      header.className = "code-shell__header";

      const title = document.createElement("span");
      title.className = "code-shell__filename";
      title.textContent = filename;

      const copyButton = document.createElement("button");
      copyButton.type = "button";
      copyButton.className = "code-copy-button";
      copyButton.textContent = copyLabel;
      copyButton.setAttribute("aria-label", copyLabel);
      copyButton.dataset.state = "idle";

      const handleCopy = async () => {
        copyButton.dataset.state = "loading";
        const copied = await copyText(rawCode);
        copyButton.textContent = copied ? copiedLabel : failedLabel;
        copyButton.dataset.state = copied ? "copied" : "failed";
        window.setTimeout(() => {
          copyButton.textContent = copyLabel;
          copyButton.dataset.state = "idle";
        }, 2000);
      };

      copyButton.addEventListener("click", handleCopy);
      preElement.parentNode?.insertBefore(shell, preElement);
      header.append(title, copyButton);
      shell.append(header, preElement);

      cleanupHandlers.push(() => {
        copyButton.removeEventListener("click", handleCopy);
        shell.parentNode?.insertBefore(preElement, shell);
        shell.remove();
        delete preElement.dataset.enhanced;
      });
    });

    return () => {
      cleanupHandlers.forEach((cleanup) => cleanup());
    };
  }, [containerSelector, contentKey, copiedLabel, copyLabel, failedLabel]);

  return null;
}

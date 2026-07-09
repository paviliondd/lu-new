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
    if (window.isSecureContext && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Fall through to the textarea fallback below.
  }

  try {
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
  } catch {
    return false;
  }
}

function createIcon(state: "idle" | "loading" | "copied" | "failed") {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.classList.add("code-copy-button__icon");

  if (state === "copied") {
    svg.innerHTML = '<path d="M20 6 9 17l-5-5"></path>';
    return svg;
  }

  if (state === "failed") {
    svg.innerHTML = '<path d="M12 8v4"></path><path d="M12 16h.01"></path><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"></path>';
    return svg;
  }

  if (state === "loading") {
    svg.setAttribute("stroke-dasharray", "8 4");
    svg.classList.add("code-copy-button__icon--spin");
    svg.innerHTML = '<path d="M21 12a9 9 0 1 1-3-6.7"></path>';
    return svg;
  }

  svg.innerHTML = '<path d="M20 2H10a2 2 0 0 0-2 2v10"></path><path d="M4 8h10a2 2 0 0 1 2 2v10H6a2 2 0 0 1-2-2Z"></path>';
  return svg;
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

function getLanguage(preElement: HTMLElement, codeElement: HTMLElement) {
  const explicitLanguage =
    preElement.dataset.language ||
    codeElement.dataset.language ||
    codeElement.className.match(/language-([a-z0-9-]+)/i)?.[1];

  return explicitLanguage || getFilename(preElement, codeElement);
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
      const language = getLanguage(preElement, codeElement);

      const shell = document.createElement("div");
      shell.className = "code-shell";

      const header = document.createElement("div");
      header.className = "code-shell__header";

      const title = document.createElement("span");
      title.className = "code-shell__filename";
      title.textContent = language.toLowerCase();

      const copyButton = document.createElement("button");
      copyButton.type = "button";
      copyButton.className = "code-copy-button";
      copyButton.setAttribute("aria-label", copyLabel);
      copyButton.setAttribute("title", copyLabel);
      copyButton.dataset.state = "idle";
      copyButton.appendChild(createIcon("idle"));

      const handleCopy = async () => {
        if (copyButton.dataset.state === "loading") return;

        copyButton.dataset.state = "loading";
        copyButton.replaceChildren(createIcon("loading"));
        const copied = await copyText(rawCode);
        copyButton.dataset.state = copied ? "copied" : "failed";
        copyButton.setAttribute("aria-label", copied ? copiedLabel : failedLabel);
        copyButton.setAttribute("title", copied ? copiedLabel : failedLabel);
        copyButton.replaceChildren(createIcon(copied ? "copied" : "failed"));
        window.setTimeout(() => {
          copyButton.dataset.state = "idle";
          copyButton.setAttribute("aria-label", copyLabel);
          copyButton.setAttribute("title", copyLabel);
          copyButton.replaceChildren(createIcon("idle"));
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

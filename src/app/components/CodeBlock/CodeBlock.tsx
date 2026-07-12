"use client";

import { useEffect } from "react";
import { createCopyIcon, copyText } from "./CopyButton";

interface CodeBlockProps {
  containerSelector?: string;
  contentKey: string;
  copyLabel: string;
  copiedLabel: string;
  failedLabel: string;
}

export default function CodeBlock({
  containerSelector = ".article-content",
  contentKey,
  copyLabel,
  copiedLabel,
  failedLabel,
}: CodeBlockProps) {
  useEffect(() => {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const cleanupHandlers: Array<() => void> = [];
    const codeBlocks = Array.from(container.querySelectorAll("pre"));

    function createActionIcon(name: "expand" | "close" | "showMore" | "showLess") {
      const ns = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(ns, "svg");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("fill", "none");
      svg.setAttribute("stroke", "currentColor");
      svg.setAttribute("stroke-width", "2");
      svg.setAttribute("stroke-linecap", "round");
      svg.setAttribute("stroke-linejoin", "round");
      svg.classList.add("code-action-button__icon");

      if (name === "showMore") {
        svg.innerHTML = '<path d="m6 9 6 6 6-6"></path>';
      } else if (name === "showLess") {
        svg.innerHTML = '<path d="m18 15-6-6-6 6"></path>';
      } else if (name === "close") {
        svg.innerHTML = '<path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>';
      } else {
        svg.innerHTML = '<path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"></path>';
      }

      return svg;
    }

    function lineCount(value: string) {
      const normalized = value.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
      const withoutFinalNewline = normalized.endsWith("\n") ? normalized.slice(0, -1) : normalized;
      return withoutFinalNewline ? withoutFinalNewline.split("\n").length : 0;
    }

    function languageFromClass(className = "") {
      return className.match(/language-([a-z0-9-]+)/i)?.[1] || "";
    }

    function normalizeCodeLabel(value: string) {
      const normalized = value.trim();
      if (!normalized) return "";

      const hiddenLabels = new Set(["text", "txt", "plain", "plaintext"]);
      return hiddenLabels.has(normalized.toLowerCase()) ? "" : normalized;
    }

    function codeMeta(preElement: HTMLElement, codeElement: HTMLElement) {
      const filename =
        preElement.dataset.filename ||
        preElement.dataset.file ||
        preElement.dataset.title ||
        codeElement.dataset.filename ||
        "";
      const language =
        preElement.dataset.language ||
        codeElement.dataset.language ||
        languageFromClass(codeElement.className) ||
        languageFromClass(preElement.className);

      return {
        filename: normalizeCodeLabel(filename),
        language: normalizeCodeLabel(language).toLowerCase(),
      };
    }

    function copyButtonContents(state: "idle" | "loading" | "copied" | "failed") {
      const label = document.createElement("span");
      label.className = "code-copy-button__label";
      label.textContent =
        state === "copied" ? `✓ ${copiedLabel}` : state === "failed" ? failedLabel : copyLabel;
      return [createCopyIcon(state), label];
    }

    codeBlocks.forEach((preElement) => {
      const codeElement = preElement.querySelector("code");
      if (!(preElement instanceof HTMLElement) || !(codeElement instanceof HTMLElement)) {
        return;
      }

      if (preElement.dataset.enhanced === "true") return;
      preElement.dataset.enhanced = "true";
      preElement.classList.add("code-block");

      const rawCode = codeElement.textContent || "";
      const totalLines = lineCount(rawCode);
      const isLong = totalLines > 30;
      const { filename, language } = codeMeta(preElement, codeElement);
      if (language === "mermaid" || preElement.dataset.mermaid === "true") return;
      const label = filename || language;
      let backdrop: HTMLDivElement | null = null;
      let restoreMarker: Comment | null = null;

      const shell = document.createElement("div");
      shell.className = "code-shell";
      shell.dataset.lineCount = String(totalLines);
      shell.dataset.long = String(isLong);
      shell.dataset.expanded = "false";

      const header = document.createElement("div");
      header.className = "code-shell__header";

      const labelElement = document.createElement("span");
      labelElement.className = "code-shell__filename";
      labelElement.textContent = label;
      labelElement.hidden = !label;

      const toolbar = document.createElement("div");
      toolbar.className = "code-shell__toolbar";

      const expandButton = document.createElement("button");
      expandButton.type = "button";
      expandButton.className = "code-action-button";
      expandButton.setAttribute("aria-label", "Expand code");
      expandButton.setAttribute("title", "Expand code");
      expandButton.appendChild(createActionIcon("expand"));

      const closeButton = document.createElement("button");
      closeButton.type = "button";
      closeButton.className = "code-action-button code-action-button--close";
      closeButton.setAttribute("aria-label", "Close expanded code");
      closeButton.setAttribute("title", "Close expanded code");
      closeButton.appendChild(createActionIcon("close"));

      const copyButton = document.createElement("button");
      copyButton.type = "button";
      copyButton.className = "code-copy-button";
      copyButton.setAttribute("aria-label", "Copy code");
      copyButton.setAttribute("title", copyLabel);
      copyButton.dataset.state = "idle";
      copyButton.replaceChildren(...copyButtonContents("idle"));

      const handleCopy = async () => {
        if (copyButton.dataset.state === "loading") return;

        copyButton.dataset.state = "loading";
        copyButton.replaceChildren(...copyButtonContents("loading"));
        const copied = await copyText(rawCode);
        copyButton.dataset.state = copied ? "copied" : "failed";
        copyButton.setAttribute("aria-label", copied ? copiedLabel : failedLabel);
        copyButton.setAttribute("title", copied ? copiedLabel : failedLabel);
        copyButton.replaceChildren(...copyButtonContents(copied ? "copied" : "failed"));
        window.setTimeout(() => {
          copyButton.dataset.state = "idle";
          copyButton.setAttribute("aria-label", "Copy code");
          copyButton.setAttribute("title", copyLabel);
          copyButton.replaceChildren(...copyButtonContents("idle"));
        }, 2000);
      };

      const closeExpanded = () => {
        if (!backdrop || !restoreMarker) return;
        shell.classList.remove("code-shell--expanded-modal");
        document.documentElement.classList.remove("code-modal-open");
        restoreMarker.parentNode?.insertBefore(shell, restoreMarker);
        restoreMarker.remove();
        restoreMarker = null;
        backdrop.removeEventListener("click", handleBackdropClick);
        backdrop.remove();
        backdrop = null;
        expandButton.hidden = false;
      };

      const handleExpand = () => {
        if (backdrop) {
          closeExpanded();
          return;
        }

        restoreMarker = document.createComment("code-shell-restore");
        backdrop = document.createElement("div");
        backdrop.className = "code-modal-backdrop";
        backdrop.setAttribute("role", "presentation");
        backdrop.addEventListener("click", handleBackdropClick);
        shell.parentNode?.insertBefore(restoreMarker, shell);
        restoreMarker.parentNode?.insertBefore(backdrop, restoreMarker);
        backdrop.appendChild(shell);
        shell.classList.add("code-shell--expanded-modal");
        document.documentElement.classList.add("code-modal-open");
        expandButton.hidden = true;
        closeButton.focus();
      };

      const handleBackdropClick = (event: MouseEvent) => {
        if (event.target === backdrop) closeExpanded();
      };

      const handleShellClick = (event: MouseEvent) => {
        if (backdrop) event.stopPropagation();
      };

      const handleEsc = (event: KeyboardEvent) => {
        if (event.key === "Escape") closeExpanded();
      };

      const footer = document.createElement("div");
      footer.className = "code-shell__footer";
      footer.hidden = !isLong;

      const toggleButton = document.createElement("button");
      toggleButton.type = "button";
      toggleButton.className = "code-toggle-button";
      toggleButton.append(createActionIcon("showMore"), document.createTextNode(`Show more lines (${totalLines})`));

      const handleToggle = () => {
        const expanded = shell.dataset.expanded !== "true";
        shell.dataset.expanded = String(expanded);
        toggleButton.replaceChildren(
          createActionIcon(expanded ? "showLess" : "showMore"),
          document.createTextNode(expanded ? "Show less" : `Show more lines (${totalLines})`)
        );
      };

      toggleButton.addEventListener("click", handleToggle);
      footer.append(toggleButton);
      expandButton.addEventListener("click", handleExpand);
      closeButton.addEventListener("click", closeExpanded);
      shell.addEventListener("click", handleShellClick);
      window.addEventListener("keydown", handleEsc);
      copyButton.addEventListener("click", handleCopy);
      preElement.parentNode?.insertBefore(shell, preElement);
      toolbar.append(expandButton, closeButton, copyButton);
      header.append(labelElement, toolbar);
      shell.append(header, preElement, footer);

      cleanupHandlers.push(() => {
        toggleButton.removeEventListener("click", handleToggle);
        expandButton.removeEventListener("click", handleExpand);
        closeButton.removeEventListener("click", closeExpanded);
        shell.removeEventListener("click", handleShellClick);
        window.removeEventListener("keydown", handleEsc);
        copyButton.removeEventListener("click", handleCopy);
        closeExpanded();
        document.documentElement.classList.remove("code-modal-open");
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

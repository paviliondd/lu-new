"use client";

import { useEffect } from "react";
import { createCopyIcon, copyText } from "./CopyButton";

interface CodeBlockProps {
  containerSelector?: string;
  contentKey: string;
  copyLabel: string;
  copiedLabel: string;
  failedLabel: string;
  explainLabel: string;
  noExplanationLabel: string;
  closeExplainLabel: string;
  showMoreLabel: string;
  showLessLabel: string;
}

export default function CodeBlock({
  containerSelector = ".article-content",
  contentKey,
  copyLabel,
  copiedLabel,
  failedLabel,
  explainLabel,
  noExplanationLabel,
  closeExplainLabel,
  showMoreLabel,
  showLessLabel,
}: CodeBlockProps) {
  useEffect(() => {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const cleanupHandlers: Array<() => void> = [];
    const codeBlocks = Array.from(container.querySelectorAll("pre"));

    function createActionIcon(name: "expand" | "close" | "showMore" | "showLess" | "explain") {
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
      } else if (name === "explain") {
        svg.innerHTML = '<path d="M8 6h13"></path><path d="M8 12h13"></path><path d="M8 18h13"></path><path d="M3 6h.01"></path><path d="M3 12h.01"></path><path d="M3 18h.01"></path>';
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

    function findExplanation(preElement: HTMLElement, codeElement: HTMLElement) {
      const explanationId = preElement.dataset.explanationId || codeElement.dataset.explanationId || "";
      if (explanationId) {
        const target = document.getElementById(explanationId);
        if (target instanceof HTMLElement) return target;
      }

      const nextElement = preElement.nextElementSibling;
      if (
        nextElement instanceof HTMLElement &&
        (nextElement.matches("[data-code-explanation]") ||
          nextElement.classList.contains("code-explanation") ||
          nextElement.classList.contains("code-block-explanation"))
      ) {
        return nextElement;
      }

      return null;
    }

    function copyButtonContents(state: "idle" | "loading" | "copied" | "failed") {
      return [createCopyIcon(state)];
    }

    codeBlocks.forEach((preElement, blockIndex) => {
      const codeElement = preElement.querySelector("code");
      if (!(preElement instanceof HTMLElement) || !(codeElement instanceof HTMLElement)) {
        return;
      }

      if (preElement.dataset.enhanced === "true") return;
      preElement.dataset.enhanced = "true";
      preElement.classList.add("code-block");

      const rawCode = codeElement.textContent || "";
      const totalLines = lineCount(rawCode);
      const isLong = totalLines > 10;
      const { filename, language } = codeMeta(preElement, codeElement);
      if (language === "mermaid" || preElement.dataset.mermaid === "true") return;
      const label = filename || language;
      let explanationElement = findExplanation(preElement, codeElement);
      const createdExplanation = !explanationElement;
      if (!explanationElement) {
        explanationElement = document.createElement("aside");
        explanationElement.dataset.codeExplanation = "";
        explanationElement.dataset.empty = "true";
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "code-explanation-panel__empty";
        emptyMessage.textContent = noExplanationLabel;
        explanationElement.append(emptyMessage);
      }
      explanationElement.id ||= `code-explanation-${blockIndex}`;
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

      const explainButton = document.createElement("button");
      explainButton.type = "button";
      explainButton.className = "code-explain-button";
      explainButton.setAttribute("aria-expanded", "false");
      explainButton.setAttribute("aria-controls", explanationElement.id);
      explainButton.setAttribute("title", explainLabel);
      explainButton.append(createActionIcon("explain"), document.createTextNode(explainLabel));

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
        let copied = false;
        try {
          copied = await copyText(rawCode);
        } catch {
          copied = false;
        }
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

      const handleExplainToggle = () => {
        const expanded = explainButton.getAttribute("aria-expanded") !== "true";
        explainButton.setAttribute("aria-expanded", String(expanded));
        explainButton.setAttribute("title", expanded ? closeExplainLabel : explainLabel);
        explanationElement.hidden = !expanded;
        explanationElement.dataset.visible = String(expanded);
        explainButton.replaceChildren(
          createActionIcon("explain"),
          document.createTextNode(expanded ? closeExplainLabel : explainLabel)
        );
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
      toggleButton.append(createActionIcon("showMore"), document.createTextNode(`${showMoreLabel} (${totalLines})`));

      const handleToggle = () => {
        const expanded = shell.dataset.expanded !== "true";
        shell.dataset.expanded = String(expanded);
        toggleButton.replaceChildren(
          createActionIcon(expanded ? "showLess" : "showMore"),
          document.createTextNode(expanded ? showLessLabel : `${showMoreLabel} (${totalLines})`)
        );
      };

      explanationElement.hidden = true;
      explanationElement.dataset.visible = "false";
      explanationElement.classList.add("code-explanation-panel");

      toggleButton.addEventListener("click", handleToggle);
      footer.append(toggleButton);
      expandButton.addEventListener("click", handleExpand);
      closeButton.addEventListener("click", closeExpanded);
      explainButton.addEventListener("click", handleExplainToggle);
      shell.addEventListener("click", handleShellClick);
      window.addEventListener("keydown", handleEsc);
      copyButton.addEventListener("click", handleCopy);
      preElement.parentNode?.insertBefore(shell, preElement);
      toolbar.append(expandButton, closeButton, explainButton, copyButton);
      header.append(labelElement, toolbar);
      shell.append(header, preElement);
      shell.append(explanationElement);
      shell.append(footer);

      cleanupHandlers.push(() => {
        toggleButton.removeEventListener("click", handleToggle);
        expandButton.removeEventListener("click", handleExpand);
        closeButton.removeEventListener("click", closeExpanded);
        explainButton.removeEventListener("click", handleExplainToggle);
        shell.removeEventListener("click", handleShellClick);
        window.removeEventListener("keydown", handleEsc);
        copyButton.removeEventListener("click", handleCopy);
        closeExpanded();
        document.documentElement.classList.remove("code-modal-open");
        shell.parentNode?.insertBefore(preElement, shell);
        explanationElement.hidden = false;
        delete explanationElement.dataset.visible;
        explanationElement.classList.remove("code-explanation-panel");
        if (createdExplanation) {
          explanationElement.remove();
        } else {
          shell.parentNode?.insertBefore(explanationElement, shell);
        }
        shell.remove();
        delete preElement.dataset.enhanced;
      });
    });

    return () => {
      cleanupHandlers.forEach((cleanup) => cleanup());
    };
  }, [closeExplainLabel, containerSelector, contentKey, copiedLabel, copyLabel, explainLabel, failedLabel, noExplanationLabel, showLessLabel, showMoreLabel]);

  return null;
}

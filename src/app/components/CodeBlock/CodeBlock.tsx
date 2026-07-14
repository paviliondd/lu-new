"use client";

import { useEffect } from "react";
import { createCopyIcon, copyText } from "./CopyButton";
import { createActionIcon } from "./ExpandButton";
import { languageFromClass, normalizeCodeLabel } from "./syntax";

interface CodeBlockProps {
  containerSelector?: string;
  contentKey: string;
  copyLabel: string;
  copiedLabel: string;
  failedLabel: string;
  explainLabel: string;
  closeExplainLabel: string;
  showMoreLabel: string;
  showLessLabel: string;
  expandLabel: string;
  closeExpandedLabel: string;
}

function lineCount(value: string) {
  const normalized = value.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const withoutFinalNewline = normalized.endsWith("\n") ? normalized.slice(0, -1) : normalized;
  return withoutFinalNewline ? withoutFinalNewline.split("\n").length : 0;
}

function ensureLineNumbers(preElement: HTMLElement, codeElement: HTMLElement, source: string) {
  const highlightedLines = Array.from(codeElement.querySelectorAll(":scope > .line"));
  if (highlightedLines.length) {
    highlightedLines.forEach((line, index) => line.setAttribute("data-line", String(index + 1)));
    preElement.dataset.lineNumbers = "true";
    return;
  }

  const normalized = source.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const hasFinalNewline = normalized.endsWith("\n");
  const lines = (hasFinalNewline ? normalized.slice(0, -1) : normalized).split("\n");
  const fragment = document.createDocumentFragment();

  lines.forEach((line, index) => {
    const lineElement = document.createElement("span");
    lineElement.className = "line";
    lineElement.dataset.line = String(index + 1);
    lineElement.textContent = line;
    fragment.append(lineElement);
    if (index < lines.length - 1 || hasFinalNewline) fragment.append("\n");
  });

  codeElement.replaceChildren(fragment);
  preElement.dataset.lineNumbers = "true";
}

function codeMeta(preElement: HTMLElement, codeElement: HTMLElement) {
  const figure = preElement.closest("figure");
  const caption = figure?.querySelector(":scope > figcaption");
  const captionText = caption?.textContent?.replace(/\s+/g, " ").trim() || "";
  const filename =
    preElement.dataset.filename ||
    preElement.dataset.file ||
    preElement.dataset.title ||
    codeElement.dataset.filename ||
    captionText;
  const language =
    preElement.dataset.language ||
    codeElement.dataset.language ||
    languageFromClass(codeElement.className) ||
    languageFromClass(preElement.className);

  return {
    caption: caption instanceof HTMLElement ? caption : null,
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

export default function CodeBlock({
  containerSelector = ".article-content",
  contentKey,
  copyLabel,
  copiedLabel,
  failedLabel,
  explainLabel,
  closeExplainLabel,
  showMoreLabel,
  showLessLabel,
  expandLabel,
  closeExpandedLabel,
}: CodeBlockProps) {
  useEffect(() => {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const cleanupHandlers: Array<() => void> = [];
    const codeBlocks = Array.from(container.querySelectorAll("pre"));

    const copyButtonContents = (state: "idle" | "loading" | "copied" | "failed") => {
      const label = document.createElement("span");
      label.className = "code-copy-button__label";
      label.textContent = state === "copied" ? copiedLabel : state === "failed" ? failedLabel : copyLabel;
      return [createCopyIcon(state), label];
    };

    codeBlocks.forEach((preElement) => {
      const codeElement = preElement.querySelector("code");
      if (!(preElement instanceof HTMLElement) || !(codeElement instanceof HTMLElement)) return;

      const metadata = codeMeta(preElement, codeElement);
      if (metadata.language === "mermaid" || preElement.dataset.mermaid === "true") return;
      if (preElement.dataset.enhanced === "true") return;

      preElement.dataset.enhanced = "true";
      preElement.classList.add("code-block");

      const rawCode = codeElement.textContent || "";
      ensureLineNumbers(preElement, codeElement, rawCode);
      const totalLines = lineCount(rawCode);
      const isLong = totalLines > 16;
      const explanationElement = findExplanation(preElement, codeElement);
      let explanationMarker: Comment | null = null;
      let dialog: HTMLDialogElement | null = null;
      let restoreMarker: Comment | null = null;
      let focusedBeforeDialog: HTMLElement | null = null;
      let copyResetTimer: number | null = null;
      let heightFrame: number | null = null;

      const shell = document.createElement("div");
      shell.className = "code-shell";
      shell.dataset.lineCount = String(totalLines);
      shell.dataset.long = String(isLong);
      shell.dataset.expanded = "false";

      const header = document.createElement("div");
      header.className = "code-shell__header";

      const identity = document.createElement("div");
      identity.className = "code-shell__identity";
      identity.hidden = !metadata.filename && !metadata.language;

      if (metadata.filename) {
        const filenameElement = document.createElement("span");
        filenameElement.className = "code-shell__filename";
        filenameElement.append(createActionIcon("file"), document.createTextNode(metadata.filename));
        identity.append(filenameElement);
      }

      if (metadata.language) {
        const languageElement = document.createElement("span");
        languageElement.className = "code-shell__language";
        languageElement.textContent = metadata.language;
        identity.append(languageElement);
      }

      if (metadata.caption && metadata.filename) {
        metadata.caption.classList.add("code-source-caption");
      }

      const toolbar = document.createElement("div");
      toolbar.className = "code-shell__toolbar";

      const expandButton = document.createElement("button");
      expandButton.type = "button";
      expandButton.className = "code-action-button";
      expandButton.setAttribute("aria-label", expandLabel);
      expandButton.setAttribute("title", expandLabel);
      expandButton.appendChild(createActionIcon("expand"));

      const closeButton = document.createElement("button");
      closeButton.type = "button";
      closeButton.className = "code-action-button code-action-button--close";
      closeButton.setAttribute("aria-label", closeExpandedLabel);
      closeButton.setAttribute("title", closeExpandedLabel);
      closeButton.appendChild(createActionIcon("close"));

      const explainButton = document.createElement("button");
      explainButton.type = "button";
      explainButton.className = "code-explain-button";
      explainButton.setAttribute("aria-expanded", "false");
      explainButton.setAttribute("title", explainLabel);
      explainButton.hidden = !explanationElement;
      explainButton.append(createActionIcon("explain"), document.createTextNode(explainLabel));

      const copyButton = document.createElement("button");
      copyButton.type = "button";
      copyButton.className = "code-copy-button";
      copyButton.setAttribute("aria-label", copyLabel);
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
        if (copyResetTimer) window.clearTimeout(copyResetTimer);
        copyResetTimer = window.setTimeout(() => {
          copyButton.dataset.state = "idle";
          copyButton.setAttribute("aria-label", copyLabel);
          copyButton.setAttribute("title", copyLabel);
          copyButton.replaceChildren(...copyButtonContents("idle"));
        }, 2000);
      };

      const restoreExpanded = () => {
        if (!dialog || !restoreMarker) return;
        const currentDialog = dialog;
        shell.classList.remove("code-shell--expanded-modal");
        document.documentElement.classList.remove("code-modal-open");
        restoreMarker.parentNode?.insertBefore(shell, restoreMarker);
        restoreMarker.remove();
        restoreMarker = null;
        currentDialog.removeEventListener("click", handleDialogClick);
        currentDialog.removeEventListener("close", restoreExpanded);
        currentDialog.remove();
        dialog = null;
        expandButton.hidden = false;
        focusedBeforeDialog?.focus();
        focusedBeforeDialog = null;
      };

      const closeExpanded = () => {
        if (!dialog) return;
        if (dialog.open) dialog.close();
        restoreExpanded();
      };

      const handleDialogClick = (event: MouseEvent) => {
        if (event.target === dialog) closeExpanded();
      };

      const handleExpand = () => {
        if (dialog) return;

        focusedBeforeDialog = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        restoreMarker = document.createComment("code-shell-restore");
        dialog = document.createElement("dialog");
        dialog.className = "code-modal";
        dialog.setAttribute("aria-label", metadata.filename || metadata.language || expandLabel);
        dialog.addEventListener("click", handleDialogClick);
        dialog.addEventListener("close", restoreExpanded);
        shell.parentNode?.insertBefore(restoreMarker, shell);
        restoreMarker.parentNode?.insertBefore(dialog, restoreMarker);
        dialog.appendChild(shell);
        shell.classList.add("code-shell--expanded-modal");
        document.documentElement.classList.add("code-modal-open");
        expandButton.hidden = true;

        try {
          dialog.showModal();
          closeButton.focus();
        } catch {
          restoreExpanded();
        }
      };

      const handleExplainToggle = () => {
        if (!explanationElement) return;
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

      const footer = document.createElement("div");
      footer.className = "code-shell__footer";
      footer.hidden = !isLong;

      const toggleButton = document.createElement("button");
      toggleButton.type = "button";
      toggleButton.className = "code-toggle-button";
      toggleButton.setAttribute("aria-expanded", "false");
      toggleButton.append(
        createActionIcon("showMore"),
        document.createTextNode(`${showMoreLabel} (${totalLines})`)
      );

      const updateExpandedHeight = () => {
        preElement.style.setProperty("--code-expanded-height", `${preElement.scrollHeight}px`);
      };

      const handleToggle = () => {
        const expanded = shell.dataset.expanded !== "true";
        updateExpandedHeight();
        shell.dataset.expanded = String(expanded);
        toggleButton.setAttribute("aria-expanded", String(expanded));
        toggleButton.replaceChildren(
          createActionIcon(expanded ? "collapse" : "showMore"),
          document.createTextNode(expanded ? showLessLabel : `${showMoreLabel} (${totalLines})`)
        );
      };

      if (explanationElement) {
        explanationMarker = document.createComment("code-explanation-restore");
        explanationElement.parentNode?.insertBefore(explanationMarker, explanationElement);
        explanationElement.hidden = true;
        explanationElement.dataset.visible = "false";
        explanationElement.classList.add("code-explanation-panel");
      }

      toggleButton.addEventListener("click", handleToggle);
      expandButton.addEventListener("click", handleExpand);
      closeButton.addEventListener("click", closeExpanded);
      explainButton.addEventListener("click", handleExplainToggle);
      copyButton.addEventListener("click", handleCopy);
      preElement.parentNode?.insertBefore(shell, preElement);
      toolbar.append(expandButton, explainButton, copyButton, closeButton);
      header.append(identity, toolbar);
      shell.append(header, preElement);
      if (explanationElement) shell.append(explanationElement);
      shell.append(footer);
      heightFrame = window.requestAnimationFrame(updateExpandedHeight);

      cleanupHandlers.push(() => {
        toggleButton.removeEventListener("click", handleToggle);
        expandButton.removeEventListener("click", handleExpand);
        closeButton.removeEventListener("click", closeExpanded);
        explainButton.removeEventListener("click", handleExplainToggle);
        copyButton.removeEventListener("click", handleCopy);
        if (copyResetTimer) window.clearTimeout(copyResetTimer);
        if (heightFrame) window.cancelAnimationFrame(heightFrame);
        closeExpanded();
        document.documentElement.classList.remove("code-modal-open");
        shell.parentNode?.insertBefore(preElement, shell);
        if (explanationElement && explanationMarker) {
          explanationElement.hidden = false;
          delete explanationElement.dataset.visible;
          explanationElement.classList.remove("code-explanation-panel");
          explanationMarker.parentNode?.insertBefore(explanationElement, explanationMarker);
          explanationMarker.remove();
        }
        metadata.caption?.classList.remove("code-source-caption");
        shell.remove();
        delete preElement.dataset.enhanced;
        preElement.style.removeProperty("--code-expanded-height");
      });
    });

    return () => {
      cleanupHandlers.forEach((cleanup) => cleanup());
    };
  }, [
    closeExpandedLabel,
    closeExplainLabel,
    containerSelector,
    contentKey,
    copiedLabel,
    copyLabel,
    expandLabel,
    explainLabel,
    failedLabel,
    showLessLabel,
    showMoreLabel,
  ]);

  return null;
}

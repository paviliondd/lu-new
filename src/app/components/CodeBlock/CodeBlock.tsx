"use client";

import { useEffect } from "react";
import { createCopyIcon, copyText } from "./CopyButton";
import { getCodeLanguageLabel } from "./LanguageLabel";

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

    codeBlocks.forEach((preElement) => {
      const codeElement = preElement.querySelector("code");
      if (!(preElement instanceof HTMLElement) || !(codeElement instanceof HTMLElement)) {
        return;
      }

      if (preElement.dataset.enhanced === "true") return;
      preElement.dataset.enhanced = "true";
      preElement.classList.add("code-block");

      const rawCode = codeElement.textContent || "";
      const language = getCodeLanguageLabel(preElement, codeElement);

      const shell = document.createElement("div");
      shell.className = "code-shell";

      const header = document.createElement("div");
      header.className = "code-shell__header";

      const title = document.createElement("span");
      title.className = "code-shell__filename";
      title.textContent = language;
      title.hidden = !language;

      const copyButton = document.createElement("button");
      copyButton.type = "button";
      copyButton.className = "code-copy-button";
      copyButton.setAttribute("aria-label", copyLabel);
      copyButton.setAttribute("title", copyLabel);
      copyButton.dataset.state = "idle";
      copyButton.appendChild(createCopyIcon("idle"));

      const handleCopy = async () => {
        if (copyButton.dataset.state === "loading") return;

        copyButton.dataset.state = "loading";
        copyButton.replaceChildren(createCopyIcon("loading"));
        const copied = await copyText(rawCode);
        copyButton.dataset.state = copied ? "copied" : "failed";
        copyButton.setAttribute("aria-label", copied ? copiedLabel : failedLabel);
        copyButton.setAttribute("title", copied ? copiedLabel : failedLabel);
        copyButton.replaceChildren(createCopyIcon(copied ? "copied" : "failed"));
        window.setTimeout(() => {
          copyButton.dataset.state = "idle";
          copyButton.setAttribute("aria-label", copyLabel);
          copyButton.setAttribute("title", copyLabel);
          copyButton.replaceChildren(createCopyIcon("idle"));
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

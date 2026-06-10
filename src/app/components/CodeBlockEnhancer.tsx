"use client";

import { useEffect } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-css";
import "prismjs/components/prism-json";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-yaml";

interface CodeBlockEnhancerProps {
  containerSelector?: string;
  contentKey: string;
}

function getLanguage(codeElement: HTMLElement) {
  const className = codeElement.className || "";
  const match = className.match(/language-([a-z0-9-]+)/i);
  return match?.[1] || "bash";
}

export default function CodeBlockEnhancer({
  containerSelector = ".article-content",
  contentKey,
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

      const language = getLanguage(codeElement);
      codeElement.classList.add(`language-${language}`);

      const grammar = Prism.languages[language] || Prism.languages.markup;
      const rawCode = codeElement.textContent || "";
      if (grammar) {
        codeElement.innerHTML = Prism.highlight(rawCode, grammar, language);
      }

      const copyButton = document.createElement("button");
      copyButton.type = "button";
      copyButton.className = "code-copy-button";
      copyButton.textContent = "Copy";

      const handleCopy = async () => {
        await navigator.clipboard.writeText(codeElement.textContent || rawCode);
        copyButton.textContent = "Copied";
        window.setTimeout(() => {
          copyButton.textContent = "Copy";
        }, 1600);
      };

      copyButton.addEventListener("click", handleCopy);
      preElement.appendChild(copyButton);

      cleanupHandlers.push(() => {
        copyButton.removeEventListener("click", handleCopy);
        copyButton.remove();
        delete preElement.dataset.enhanced;
      });
    });

    return () => {
      cleanupHandlers.forEach((cleanup) => cleanup());
    };
  }, [containerSelector, contentKey]);

  return null;
}

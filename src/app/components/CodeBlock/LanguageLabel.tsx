"use client";

const hiddenLanguageLabels = new Set(["", "text", "txt", "plain", "plaintext", "output"]);

export function getCodeLanguageLabel(preElement: HTMLElement, codeElement: HTMLElement) {
  const explicitLanguage =
    preElement.dataset.language ||
    codeElement.dataset.language ||
    codeElement.className.match(/language-([a-z0-9-]+)/i)?.[1] ||
    "";

  const normalized = explicitLanguage.trim().toLowerCase();
  if (hiddenLanguageLabels.has(normalized)) return "";

  return normalized;
}

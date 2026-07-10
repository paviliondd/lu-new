"use client";

import { useEffect } from "react";
import { createCopyIcon, copyText } from "./CopyButton";
import { getCodeFilename, getCodeHeaderLabel, getCodeLanguage } from "./LanguageLabel";

interface CodeBlockProps {
  containerSelector?: string;
  contentKey: string;
  copyLabel: string;
  copiedLabel: string;
  failedLabel: string;
  postSlug?: string;
}

export default function CodeBlock({
  containerSelector = ".article-content",
  contentKey,
  copyLabel,
  copiedLabel,
  failedLabel,
  postSlug,
}: CodeBlockProps) {
  useEffect(() => {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const cleanupHandlers: Array<() => void> = [];
    const codeBlocks = Array.from(container.querySelectorAll("pre"));
    let isAdmin = false;

    fetch("/api/auth/session", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { user?: unknown } | null) => {
        isAdmin = Boolean(payload?.user);
        container.querySelectorAll<HTMLElement>(".code-edit-link").forEach((link) => {
          link.hidden = !isAdmin;
        });
      })
      .catch(() => {
        isAdmin = false;
      });

    function createActionIcon(name: "expand" | "download" | "showMore" | "showLess" | "edit") {
      const ns = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(ns, "svg");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("fill", "none");
      svg.setAttribute("stroke", "currentColor");
      svg.setAttribute("stroke-width", "2");
      svg.setAttribute("stroke-linecap", "round");
      svg.setAttribute("stroke-linejoin", "round");
      svg.classList.add("code-action-button__icon");

      if (name === "download") {
        svg.innerHTML = '<path d="M12 3v12"></path><path d="m7 10 5 5 5-5"></path><path d="M5 21h14"></path>';
      } else if (name === "showMore") {
        svg.innerHTML = '<path d="m6 9 6 6 6-6"></path>';
      } else if (name === "showLess") {
        svg.innerHTML = '<path d="m18 15-6-6-6 6"></path>';
      } else if (name === "edit") {
        svg.innerHTML = '<path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>';
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

    function downloadCode(value: string, filename: string) {
      const blob = new Blob([value], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    }

    function defaultFilename(language: string) {
      const names: Record<string, string> = {
        bash: "script.sh",
        dockerfile: "Dockerfile",
        hcl: "main.hcl",
        javascript: "script.js",
        json: "config.json",
        nginx: "nginx.conf",
        python: "script.py",
        shell: "script.sh",
        sh: "script.sh",
        sql: "query.sql",
        terraform: "main.tf",
        typescript: "script.ts",
        yaml: "config.yaml",
      };

      return names[language] || "code.txt";
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
      const language = getCodeLanguage(preElement, codeElement);
      const filename = getCodeFilename(preElement, codeElement);
      const label = getCodeHeaderLabel(preElement, codeElement);
      const totalLines = lineCount(rawCode);
      const isLong = totalLines > 30;

      const shell = document.createElement("div");
      shell.className = "code-shell";
      shell.dataset.lineCount = String(totalLines);
      shell.dataset.long = String(isLong);
      shell.dataset.expanded = "false";

      const header = document.createElement("div");
      header.className = "code-shell__header";

      const title = document.createElement("span");
      title.className = "code-shell__filename";
      title.textContent = label;
      title.hidden = !label;

      const toolbar = document.createElement("div");
      toolbar.className = "code-shell__toolbar";

      const expandButton = document.createElement("button");
      expandButton.type = "button";
      expandButton.className = "code-action-button";
      expandButton.setAttribute("aria-label", "Expand code");
      expandButton.setAttribute("title", "Expand code");
      expandButton.appendChild(createActionIcon("expand"));

      const downloadButton = document.createElement("button");
      downloadButton.type = "button";
      downloadButton.className = "code-action-button";
      downloadButton.setAttribute("aria-label", "Download code");
      downloadButton.setAttribute("title", "Download code");
      downloadButton.appendChild(createActionIcon("download"));

      const editLink = document.createElement("a");
      editLink.className = "code-edit-link";
      editLink.href = postSlug
        ? `/admin/collections/posts?where[slug][equals]=${encodeURIComponent(postSlug)}`
        : "/admin/collections/posts";
      editLink.setAttribute("aria-label", "Edit post");
      editLink.setAttribute("title", "Edit post");
      editLink.hidden = !isAdmin;
      editLink.append(createActionIcon("edit"), document.createTextNode("Edit"));

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

      const handleDownload = () => {
        downloadCode(rawCode, filename || defaultFilename(language));
      };

      const handleExpand = () => {
        shell.classList.toggle("code-shell--fullscreen");
        const expanded = shell.classList.contains("code-shell--fullscreen");
        document.documentElement.classList.toggle("code-fullscreen-open", expanded);
        expandButton.setAttribute("aria-label", expanded ? "Close expanded code" : "Expand code");
        expandButton.setAttribute("title", expanded ? "Close expanded code" : "Expand code");
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
      downloadButton.addEventListener("click", handleDownload);
      expandButton.addEventListener("click", handleExpand);
      copyButton.addEventListener("click", handleCopy);
      preElement.parentNode?.insertBefore(shell, preElement);
      toolbar.append(editLink, expandButton, downloadButton, copyButton);
      header.append(title, toolbar);
      shell.append(header, preElement, footer);

      cleanupHandlers.push(() => {
        toggleButton.removeEventListener("click", handleToggle);
        downloadButton.removeEventListener("click", handleDownload);
        expandButton.removeEventListener("click", handleExpand);
        copyButton.removeEventListener("click", handleCopy);
        document.documentElement.classList.remove("code-fullscreen-open");
        shell.parentNode?.insertBefore(preElement, shell);
        shell.remove();
        delete preElement.dataset.enhanced;
      });
    });

    return () => {
      cleanupHandlers.forEach((cleanup) => cleanup());
    };
  }, [containerSelector, contentKey, copiedLabel, copyLabel, failedLabel, postSlug]);

  return null;
}

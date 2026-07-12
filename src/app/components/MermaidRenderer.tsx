"use client";

import { useEffect } from "react";

interface MermaidRendererProps {
  containerSelector?: string;
  contentKey: string;
}

function isDarkMode() {
  return document.documentElement.classList.contains("dark");
}

export default function MermaidRenderer({
  containerSelector = ".article-content",
  contentKey,
}: MermaidRendererProps) {
  useEffect(() => {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    const root = container;

    let cancelled = false;
    const cleanupHandlers: Array<() => void> = [];

    async function renderMermaid() {
      const mermaid = (await import("mermaid")).default;
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: isDarkMode() ? "dark" : "default",
      });

      const blocks = Array.from(
        root.querySelectorAll<HTMLElement>(
          'pre[data-mermaid="true"], pre[data-language="mermaid"], pre:has(code.language-mermaid)'
        )
      );

      for (const [index, preElement] of blocks.entries()) {
        if (cancelled || preElement.dataset.mermaidEnhanced === "true") continue;
        const codeElement = preElement.querySelector("code");
        const source = (codeElement?.textContent || preElement.textContent || "").trim();
        if (!source) continue;

        preElement.dataset.mermaidEnhanced = "true";
        const shell = document.createElement("figure");
        shell.className = "mermaid-shell";

        const toolbar = document.createElement("div");
        toolbar.className = "mermaid-shell__toolbar";
        toolbar.innerHTML = "<span>mermaid</span>";

        const zoomOut = document.createElement("button");
        zoomOut.type = "button";
        zoomOut.textContent = "-";
        zoomOut.setAttribute("aria-label", "Zoom out diagram");

        const zoomIn = document.createElement("button");
        zoomIn.type = "button";
        zoomIn.textContent = "+";
        zoomIn.setAttribute("aria-label", "Zoom in diagram");

        const reset = document.createElement("button");
        reset.type = "button";
        reset.textContent = "Reset";
        reset.setAttribute("aria-label", "Reset diagram zoom");

        toolbar.append(zoomOut, zoomIn, reset);

        const stage = document.createElement("div");
        stage.className = "mermaid-shell__stage";
        let scale = 1;

        const applyScale = () => {
          stage.style.setProperty("--mermaid-scale", String(scale));
        };
        const setScale = (next: number) => {
          scale = Math.min(2.4, Math.max(0.65, next));
          applyScale();
        };

        try {
          const id = `mermaid-${contentKey.replace(/[^a-z0-9_-]/gi, "-")}-${index}`;
          const result = await mermaid.render(id, source);
          if (cancelled) return;
          stage.innerHTML = result.svg;
          applyScale();
        } catch {
          stage.textContent = source;
          stage.classList.add("mermaid-shell__stage--failed");
        }

        preElement.parentNode?.insertBefore(shell, preElement);
        shell.append(toolbar, stage);
        preElement.remove();

        const handleZoomIn = () => setScale(scale + 0.15);
        const handleZoomOut = () => setScale(scale - 0.15);
        const handleReset = () => setScale(1);
        zoomIn.addEventListener("click", handleZoomIn);
        zoomOut.addEventListener("click", handleZoomOut);
        reset.addEventListener("click", handleReset);
        cleanupHandlers.push(() => {
          zoomIn.removeEventListener("click", handleZoomIn);
          zoomOut.removeEventListener("click", handleZoomOut);
          reset.removeEventListener("click", handleReset);
        });
      }
    }

    renderMermaid().catch(() => undefined);

    return () => {
      cancelled = true;
      cleanupHandlers.forEach((cleanup) => cleanup());
    };
  }, [containerSelector, contentKey]);

  return null;
}

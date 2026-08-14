"use client";

import { useState, type MouseEvent } from "react";
import { Check, Copy, Download } from "lucide-react";
import { copyText } from "../CodeBlock/copyText";

interface ArticleTableActionsProps {
  copiedLabel: string;
  copyLabel: string;
  downloadLabel: string;
}

function closestTable(event: MouseEvent<HTMLButtonElement>) {
  return event.currentTarget.closest(".article-table")?.querySelector("table") ?? null;
}

function tableText(table: HTMLTableElement | null) {
  if (!table) return "";
  return Array.from(table.rows)
    .map((row) => Array.from(row.cells).map((cell) => cell.innerText.trim()).join("\t"))
    .join("\n");
}

export default function ArticleTableActions({ copiedLabel, copyLabel, downloadLabel }: ArticleTableActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (event: MouseEvent<HTMLButtonElement>) => {
    const text = tableText(closestTable(event));
    if (!text || !(await copyText(text))) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const handleDownload = (event: MouseEvent<HTMLButtonElement>) => {
    const text = tableText(closestTable(event));
    if (!text) return;
    const url = URL.createObjectURL(new Blob([text], { type: "text/tab-separated-values;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "table.tsv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="article-table__actions">
      <button type="button" onClick={handleCopy} aria-label={copied ? copiedLabel : copyLabel} title={copied ? copiedLabel : copyLabel}>
        {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      </button>
      <button type="button" onClick={handleDownload} aria-label={downloadLabel} title={downloadLabel}>
        <Download aria-hidden="true" />
      </button>
    </div>
  );
}

"use client";

import type { ReactNode } from "react";
import { useRef, useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { copyText } from "../CodeBlock/copyText";

interface ArticleTableProps {
  children: ReactNode;
  copyLabel: string;
  copiedLabel: string;
  downloadLabel: string;
  title: string;
}

function tableText(table: HTMLTableElement | null) {
  if (!table) return "";
  return Array.from(table.rows)
    .map((row) => Array.from(row.cells).map((cell) => cell.innerText.trim()).join("\t"))
    .join("\n");
}

export default function ArticleTable({ children, copyLabel, copiedLabel, downloadLabel, title }: ArticleTableProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const getTable = () => tableRef.current?.querySelector("table") ?? null;

  const handleCopy = async () => {
    const text = tableText(getTable());
    if (!text) return;
    if (await copyText(text)) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };

  const handleDownload = () => {
    const text = tableText(getTable());
    if (!text) return;
    const url = URL.createObjectURL(new Blob([text], { type: "text/tab-separated-values;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "table.tsv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="article-table" aria-label={title}>
      <header className="article-table__header">
        <span className="article-table__title">{title}</span>
        <div className="article-table__actions">
          <button type="button" onClick={handleCopy} aria-label={copied ? copiedLabel : copyLabel} title={copied ? copiedLabel : copyLabel}>
            {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          </button>
          <button type="button" onClick={handleDownload} aria-label={downloadLabel} title={downloadLabel}>
            <Download aria-hidden="true" />
          </button>
        </div>
      </header>
      <div ref={tableRef} className="article-table__viewport">{children}</div>
    </section>
  );
}

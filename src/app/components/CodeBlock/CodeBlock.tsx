"use client";

import type { ReactNode } from "react";
import { useRef, useState } from "react";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";
import CopyCodeButton, { type CopyButtonLabels } from "./CopyButton";
import DownloadCodeButton from "./DownloadButton";

export interface CodeBlockLabels {
  copy: CopyButtonLabels;
  download: string;
  explanation: string;
  showAll: string;
  showLess: string;
}

export interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  downloadable?: boolean;
  initiallyExpanded?: boolean;
  highlightedCode?: ReactNode;
  explanation?: ReactNode;
  labels: CodeBlockLabels;
}

export function countCodeLines(value: string) {
  const normalized = value.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const withoutFinalNewline = normalized.endsWith("\n") ? normalized.slice(0, -1) : normalized;
  return withoutFinalNewline ? withoutFinalNewline.split("\n").length : 1;
}

export default function CodeBlock({
  code,
  language,
  filename,
  showLineNumbers = true,
  downloadable = Boolean(filename),
  initiallyExpanded = false,
  highlightedCode,
  explanation,
  labels,
}: CodeBlockProps) {
  const totalLines = countCodeLines(code);
  const isLong = totalLines > 20;
  const [expanded, setExpanded] = useState(initiallyExpanded || !isLong);
  const cardRef = useRef<HTMLElement>(null);
  const lineNumbers = Array.from({ length: totalLines }, (_, index) => index + 1);

  const toggleExpanded = () => {
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);

    const card = cardRef.current;
    const cardTop = card?.getBoundingClientRect().top;
    if (!nextExpanded && typeof cardTop === "number" && cardTop < 112) {
      card?.scrollIntoView({ block: "start", behavior: "auto" });
    }
  };

  return (
    <section
      ref={cardRef}
      className="code-card"
      data-long={isLong || undefined}
      data-expanded={expanded}
      aria-label={filename || language || "Code"}
    >
      <header
        className="code-card__header"
        data-compact={!filename && !language ? "true" : undefined}
      >
        <div className="code-card__identity">
          {filename && (
            <span className="code-card__filename" title={filename}>
              <FileText className="code-action-icon" aria-hidden="true" />
              <span>{filename}</span>
            </span>
          )}
          {language && <span className="code-card__language">{language}</span>}
        </div>

        <div className="code-card__actions">
          {downloadable && filename && (
            <DownloadCodeButton code={code} filename={filename} label={labels.download} />
          )}
          <CopyCodeButton code={code} labels={labels.copy} />
        </div>
      </header>

      <div className="code-card__viewport" data-collapsed={isLong && !expanded ? "true" : undefined}>
        <pre>
          <code className="code-card__code">
            {showLineNumbers && (
              <span className="code-card__line-numbers" aria-hidden="true">
                {lineNumbers.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </span>
            )}
            <span className="code-card__source">{highlightedCode ?? code}</span>
          </code>
        </pre>
      </div>

      {explanation && (
        <details className="code-card__explanation">
          <summary>{labels.explanation}</summary>
          <div>{explanation}</div>
        </details>
      )}

      {isLong && (
        <footer className="code-card__footer">
          <button type="button" className="code-card__toggle" aria-expanded={expanded} onClick={toggleExpanded}>
            {expanded ? (
              <ChevronUp className="code-action-icon" aria-hidden="true" />
            ) : (
              <ChevronDown className="code-action-icon" aria-hidden="true" />
            )}
            <span>{expanded ? labels.showLess : `${labels.showAll} ${totalLines} dòng`}</span>
          </button>
        </footer>
      )}
    </section>
  );
}

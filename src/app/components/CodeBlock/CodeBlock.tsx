"use client";

import type { ReactNode } from "react";
import { useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { formatLanguageLabel } from "./syntax";
import CopyCodeButton, { type CopyButtonLabels } from "./CopyButton";

export interface CodeBlockLabels {
  copy: CopyButtonLabels;
  download: string;
  explanation: string;
  showAll: string;
  showLess: string;
  lines: string;
  code: string;
  preview: string;
  table: {
    title: string;
    copy: string;
    copied: string;
    download: string;
  };
}

export interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
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
  showLineNumbers = false,
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
  const displayLanguage = formatLanguageLabel(language);

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
      aria-label={displayLanguage || "Code"}
    >
      <header
        className="code-card__header"
        data-compact={!displayLanguage ? "true" : undefined}
      >
        <div className="code-card__identity">
          {displayLanguage && <span className="code-card__language">{displayLanguage}</span>}
        </div>

        <div className="code-card__actions">
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
            <span>{expanded ? labels.showLess : `${labels.showAll} ${totalLines} ${labels.lines}`}</span>
          </button>
        </footer>
      )}
    </section>
  );
}

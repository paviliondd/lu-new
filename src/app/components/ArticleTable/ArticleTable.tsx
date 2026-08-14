import type { ReactNode } from "react";
import ArticleTableActions from "./ArticleTableActions";

interface ArticleTableProps {
  children: ReactNode;
  copyLabel: string;
  copiedLabel: string;
  downloadLabel: string;
  title: string;
}

export default function ArticleTable({ children, copyLabel, copiedLabel, downloadLabel, title }: ArticleTableProps) {
  return (
    <section className="article-table" aria-label={title}>
      <header className="article-table__header">
        <span className="article-table__title">{title}</span>
        <ArticleTableActions
          copiedLabel={copiedLabel}
          copyLabel={copyLabel}
          downloadLabel={downloadLabel}
        />
      </header>
      <div className="article-table__viewport">{children}</div>
    </section>
  );
}

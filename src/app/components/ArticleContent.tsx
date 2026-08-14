"use client";

import { useEffect, useState } from "react";
import RichTextRenderer from "./RichTextRenderer";
import { getCodeBlockLabels } from "./CodeBlock/labels";
import type { Locale } from "@/i18n/config";

interface ArticleContentProps {
  assetBase?: string;
  content: string;
  contentKey: string;
  language: Locale;
  legacyAssetOrigins?: string[];
}

export default function ArticleContent({
  assetBase,
  content,
  contentKey,
  language,
  legacyAssetOrigins,
}: ArticleContentProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <section className="article-content-gate" aria-busy={!ready}>
      {!ready && (
        <div
          className="article-reading-frame animate-pulse rounded-xl border theme-border bg-[var(--site-panel)] px-5 py-8 text-center text-sm theme-muted"
          role="status"
        >
          Preparing article…
        </div>
      )}
      <div hidden={!ready}>
        <RichTextRenderer
          assetBase={assetBase}
          content={content}
          contentKey={contentKey}
          labels={getCodeBlockLabels(language)}
          legacyAssetOrigins={legacyAssetOrigins}
        />
      </div>
    </section>
  );
}

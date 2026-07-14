"use client";

import ArticleImageEnhancer from "../ArticleImageEnhancer";
import CodeBlock from "../CodeBlock";
import MermaidRenderer from "../MermaidRenderer";

interface RichTextRendererProps {
  assetBase?: string;
  content: string;
  contentKey: string;
  copyLabel: string;
  copiedLabel: string;
  closeExplainLabel: string;
  explainLabel: string;
  failedLabel: string;
  showLessLabel: string;
  showMoreLabel: string;
  expandLabel: string;
  closeExpandedLabel: string;
  legacyAssetOrigins?: string[];
}

export default function RichTextRenderer({
  assetBase,
  content,
  contentKey,
  copyLabel,
  copiedLabel,
  closeExplainLabel,
  explainLabel,
  failedLabel,
  showLessLabel,
  showMoreLabel,
  expandLabel,
  closeExpandedLabel,
  legacyAssetOrigins,
}: RichTextRendererProps) {
  return (
    <div className="article-content article-content--reading prose mx-auto w-full max-w-[900px] dark:prose-invert">
      <CodeBlock
        contentKey={contentKey}
        copyLabel={copyLabel}
        copiedLabel={copiedLabel}
        closeExplainLabel={closeExplainLabel}
        explainLabel={explainLabel}
        failedLabel={failedLabel}
        showLessLabel={showLessLabel}
        showMoreLabel={showMoreLabel}
        expandLabel={expandLabel}
        closeExpandedLabel={closeExpandedLabel}
      />
      <MermaidRenderer contentKey={contentKey} />
      <ArticleImageEnhancer
        assetBase={assetBase}
        contentKey={contentKey}
        legacyAssetOrigins={legacyAssetOrigins}
      />
      <div className="article-content__body" dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}

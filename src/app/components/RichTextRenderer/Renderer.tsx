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
  noExplanationLabel: string;
  failedLabel: string;
  showLessLabel: string;
  showMoreLabel: string;
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
  noExplanationLabel,
  failedLabel,
  showLessLabel,
  showMoreLabel,
  legacyAssetOrigins,
}: RichTextRendererProps) {
  return (
    <div className="article-content prose max-w-none overflow-hidden dark:prose-invert">
      <CodeBlock
        contentKey={contentKey}
        copyLabel={copyLabel}
        copiedLabel={copiedLabel}
        closeExplainLabel={closeExplainLabel}
        explainLabel={explainLabel}
        noExplanationLabel={noExplanationLabel}
        failedLabel={failedLabel}
        showLessLabel={showLessLabel}
        showMoreLabel={showMoreLabel}
      />
      <MermaidRenderer contentKey={contentKey} />
      <ArticleImageEnhancer
        assetBase={assetBase}
        contentKey={contentKey}
        legacyAssetOrigins={legacyAssetOrigins}
      />
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}

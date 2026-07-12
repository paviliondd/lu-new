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
  failedLabel: string;
  legacyAssetOrigins?: string[];
}

export default function RichTextRenderer({
  assetBase,
  content,
  contentKey,
  copyLabel,
  copiedLabel,
  failedLabel,
  legacyAssetOrigins,
}: RichTextRendererProps) {
  return (
    <div className="article-content prose max-w-none overflow-hidden dark:prose-invert">
      <CodeBlock
        contentKey={contentKey}
        copyLabel={copyLabel}
        copiedLabel={copiedLabel}
        failedLabel={failedLabel}
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

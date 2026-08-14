"use client";

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
  return (
    <RichTextRenderer
      assetBase={assetBase}
      content={content}
      contentKey={contentKey}
      labels={getCodeBlockLabels(language)}
      legacyAssetOrigins={legacyAssetOrigins}
    />
  );
}

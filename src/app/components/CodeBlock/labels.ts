import type { CodeBlockLabels } from "./CodeBlock";

const labels: Record<"vi" | "en", CodeBlockLabels> = {
  vi: {
    copy: {
      idle: "Copy",
      copying: "Copying",
      success: "Copied",
      error: "Unable to copy",
      errorHelp: "Clipboard access failed. Select the code and press Ctrl/Cmd+C.",
    },
    download: "Download",
    explanation: "Explanation",
    showAll: "Show all",
    showLess: "Show less",
    lines: "lines",
    code: "Code",
    preview: "Preview",
    table: {
      title: "Table",
      copy: "Copy table",
      copied: "Copied",
      download: "Download table",
    },
  },
  en: {
    copy: {
      idle: "Copy",
      copying: "Copying",
      success: "Copied",
      error: "Unable to copy",
      errorHelp: "Clipboard access failed. Select the code and press Ctrl/Cmd+C.",
    },
    download: "Download",
    explanation: "Explanation",
    showAll: "Show all",
    showLess: "Show less",
    lines: "lines",
    code: "Code",
    preview: "Preview",
    table: {
      title: "Table",
      copy: "Copy table",
      copied: "Copied",
      download: "Download table",
    },
  },
};

export function getCodeBlockLabels(language: string) {
  return labels[language === "en" ? "en" : "vi"];
}

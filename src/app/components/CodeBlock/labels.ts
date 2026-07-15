import type { CodeBlockLabels } from "./CodeBlock";

const labels: Record<"vi" | "en", CodeBlockLabels> = {
  vi: {
    copy: {
      idle: "Sao chép",
      copying: "Đang sao chép",
      success: "Đã sao chép",
      error: "Không thể sao chép",
      errorHelp: "Không thể truy cập clipboard. Hãy chọn đoạn code và nhấn Ctrl/Cmd+C.",
    },
    download: "Tải file",
    explanation: "Giải thích",
    showAll: "Xem toàn bộ",
    showLess: "Thu gọn",
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
  },
};

export function getCodeBlockLabels(language: string) {
  return labels[language === "en" ? "en" : "vi"];
}

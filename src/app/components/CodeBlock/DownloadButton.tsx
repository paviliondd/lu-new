"use client";

import { Download } from "lucide-react";

export function sanitizeFilename(filename: string) {
  return filename.replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-").trim() || "code.txt";
}

export function downloadCode(code: string, filename: string) {
  const safeFilename = sanitizeFilename(filename);
  const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = safeFilename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}

interface DownloadCodeButtonProps {
  code: string;
  filename: string;
  label: string;
}

export default function DownloadCodeButton({ code, filename, label }: DownloadCodeButtonProps) {
  return (
    <button
      type="button"
      className="code-download-button"
      onClick={() => downloadCode(code, filename)}
    >
      <Download className="code-action-icon" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}

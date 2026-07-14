import type { BundledLanguage } from "shiki";

const languageAliases: Record<string, BundledLanguage> = {
  aws: "bash",
  awscli: "bash",
  bash: "bash",
  console: "bash",
  docker: "dockerfile",
  dockerfile: "dockerfile",
  hcl: "hcl",
  html: "html",
  js: "javascript",
  javascript: "javascript",
  jsx: "jsx",
  json: "json",
  markdown: "markdown",
  md: "markdown",
  nginx: "nginx",
  py: "python",
  python: "python",
  shell: "bash",
  sh: "bash",
  sql: "sql",
  terraform: "terraform",
  tf: "terraform",
  ts: "typescript",
  tsx: "tsx",
  typescript: "typescript",
  yml: "yaml",
  yaml: "yaml",
};

export function languageFromClass(className = "") {
  return className.match(/language-([a-z0-9-]+)/i)?.[1]?.toLowerCase() || "";
}

export function normalizeLanguage(language = "") {
  const normalized = language.trim().toLowerCase() || "text";
  return languageAliases[normalized] || (normalized as BundledLanguage);
}

export function normalizeCodeLabel(value = "") {
  const normalized = value.trim();
  if (!normalized) return "";

  return ["text", "txt", "plain", "plaintext"].includes(normalized.toLowerCase())
    ? ""
    : normalized;
}

export function shouldShowLanguage(language: BundledLanguage) {
  return !["text", "txt", "plain", "plaintext"].includes(String(language).toLowerCase());
}

export function formatCodeSource(source: string, language: string) {
  const normalizedLanguage = normalizeLanguage(language);
  if (normalizedLanguage !== "json") return source;

  try {
    const formatted = JSON.stringify(JSON.parse(source), null, 2);
    return source.endsWith("\n") ? `${formatted}\n` : formatted;
  } catch {
    return source;
  }
}

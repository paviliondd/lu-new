import type { BundledLanguage } from "shiki";

export const DEFAULT_CODE_LANGUAGE: BundledLanguage = "bash";

const languageAliases: Record<string, BundledLanguage> = {
  aws: "bash",
  awscli: "bash",
  bash: "bash",
  console: "bash",
  docker: "dockerfile",
  dockerfile: "dockerfile",
  go: "go",
  golang: "go",
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

const plainTextLanguages = ["text", "txt", "plain", "plaintext"];

export function languageFromClass(className = "") {
  return className.match(/language-([a-z0-9-]+)/i)?.[1]?.toLowerCase() || "";
}

export function normalizeLanguage(language = "") {
  const normalized = language.trim().toLowerCase();
  if (!normalized || plainTextLanguages.includes(normalized)) return DEFAULT_CODE_LANGUAGE;
  return languageAliases[normalized] || DEFAULT_CODE_LANGUAGE;
}

export function normalizeCodeLabel(value = "") {
  const normalized = value.trim();
  if (!normalized) return "bash";

  return plainTextLanguages.includes(normalized.toLowerCase())
    ? "bash"
    : normalized;
}

export function normalizeCodeLanguageLabel(value = "") {
  return normalizeLanguage(value);
}

const languageDisplayNames: Record<string, string> = {
  html: "HTML",
  css: "CSS",
  javascript: "JavaScript",
  js: "JavaScript",
  json: "JSON",
  jsx: "JSX",
  go: "Go",
  golang: "Go",
  markdown: "Markdown",
  md: "Markdown",
  python: "Python",
  py: "Python",
  sql: "SQL",
  typescript: "TypeScript",
  ts: "TypeScript",
  tsx: "TSX",
  yaml: "YAML",
  yml: "YAML",
  bash: "Bash",
  shell: "Bash",
  sh: "Bash",
};

export function formatLanguageLabel(language = "") {
  const normalized = language.trim().toLowerCase();
  if (!normalized || plainTextLanguages.includes(normalized)) return "Bash";
  const resolvedLang = normalizeLanguage(normalized);
  return languageDisplayNames[normalized] || languageDisplayNames[resolvedLang] || (normalized.charAt(0).toUpperCase() + normalized.slice(1));
}

export function shouldShowLanguage(_language?: unknown) {
  return Boolean(_language) || true;
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

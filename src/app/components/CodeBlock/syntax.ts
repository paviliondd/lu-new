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

export function detectCodeLanguage(explicitLanguage = ""): string {
  const lowerExplicit = explicitLanguage.trim().toLowerCase();
  if (!lowerExplicit || plainTextLanguages.includes(lowerExplicit)) {
    return "";
  }
  return languageAliases[lowerExplicit] || lowerExplicit;
}

export function normalizeCodeLabel(value = "") {
  const normalized = value.trim().toLowerCase();
  if (!normalized || plainTextLanguages.includes(normalized)) {
    return "";
  }
  return normalized;
}

export function normalizeCodeLanguageLabel(value = "") {
  return normalizeLanguage(value);
}

const languageDisplayNames: Record<string, string> = {
  bash: "bash",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  aws: "bash",
  awscli: "bash",
  console: "bash",
  c: "c",
  cpp: "cpp",
  csharp: "csharp",
  css: "css",
  diff: "diff",
  docker: "dockerfile",
  dockerfile: "dockerfile",
  go: "go",
  golang: "go",
  graphql: "graphql",
  hcl: "hcl",
  html: "html",
  ini: "ini",
  java: "java",
  javascript: "javascript",
  js: "javascript",
  json: "json",
  jsx: "jsx",
  markdown: "markdown",
  md: "markdown",
  mermaid: "mermaid",
  nginx: "nginx",
  php: "php",
  plain: "plaintext",
  plaintext: "plaintext",
  text: "plaintext",
  powershell: "powershell",
  ps1: "powershell",
  py: "python",
  python: "python",
  ruby: "ruby",
  rust: "rust",
  scss: "scss",
  sql: "sql",
  terraform: "terraform",
  tf: "terraform",
  toml: "toml",
  ts: "typescript",
  tsx: "tsx",
  typescript: "typescript",
  xml: "xml",
  yaml: "yaml",
  yml: "yaml",
};

export function formatLanguageLabel(language = "") {
  const normalized = language.trim().toLowerCase();
  if (!normalized || plainTextLanguages.includes(normalized)) {
    return "";
  }
  const resolvedLang = languageAliases[normalized] || normalized;
  return (languageDisplayNames[normalized] || languageDisplayNames[resolvedLang] || resolvedLang).toLowerCase();
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

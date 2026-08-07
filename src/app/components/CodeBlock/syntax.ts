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

export function detectCodeLanguage(code = "") {
  if (!code || !code.trim()) return "";
  const trimmed = code.trim();

  const hasYamlKeys = /^\s*[\w\d_-]+\s*:\s+.*$/m.test(trimmed);
  const hasYamlList = /^\s*-\s+[\w\d_-]+/m.test(trimmed);
  const hasDocStart = /^---/m.test(trimmed);
  const isCode = /^(const|let|var|function|import|export|class|interface|type|package|public|private)\b/m.test(trimmed);

  if ((hasDocStart || (hasYamlKeys && (hasYamlList || /^\s*name:/m.test(trimmed) || /^\s*tasks:/m.test(trimmed)))) && !isCode) {
    return "yaml";
  }

  const hasShebang = /^\s*#!\/(bin|usr\/bin)\/(bash|sh|zsh)/m.test(trimmed);
  const hasBashCmds = /^\s*(eval\s|ssh-add\s|sudo\s|apt\s|yum\s|dnf\s|systemctl\s|ansible\b|ansible-playbook\b|docker\s|docker-compose\s|kubectl\s|git\s|npm\s|yarn\s|pnpm\s|npx\s|pip\s|curl\s|wget\s)/m.test(trimmed);
  const hasPrompt = /^\s*[$#]\s+\w+/m.test(trimmed);

  if (hasShebang || hasBashCmds || hasPrompt) {
    return "bash";
  }

  if (hasYamlKeys && !isCode) {
    return "yaml";
  }

  return "";
}

export function normalizeCodeLabel(value = "", code = "") {
  const normalized = value.trim();
  if (!normalized || plainTextLanguages.includes(normalized.toLowerCase())) {
    if (code) return detectCodeLanguage(code);
    return "";
  }

  return normalized;
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

export function formatLanguageLabel(language = "", code = "") {
  let normalized = language.trim().toLowerCase();
  if (!normalized || plainTextLanguages.includes(normalized)) {
    if (code) {
      normalized = detectCodeLanguage(code);
    } else {
      normalized = "";
    }
  }

  if (!normalized) return "";
  const resolvedLang = languageAliases[normalized] || normalized;
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

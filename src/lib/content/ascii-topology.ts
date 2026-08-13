const plainTextLanguages = new Set(["", "ascii", "plain", "plaintext", "text", "txt"]);

export function unwrapMarkdownCodeFence(source: string) {
  const normalized = source.replace(/\r\n?/g, "\n").trim();
  const match = normalized.match(/^```([a-z0-9_-]*)\s*\n([\s\S]*?)\n```$/i);

  return match
    ? { language: match[1].toLowerCase(), source: match[2] }
    : { language: "", source: normalized };
}

export function resolveCodeBlockLanguage(configuredLanguage: string, fencedLanguage: string) {
  const configured = configuredLanguage.trim().toLowerCase();
  const fenced = fencedLanguage.trim().toLowerCase();
  return configured && configured !== "auto" ? configured : fenced || "auto";
}

export function isAsciiTopology(source: string, language = "") {
  const normalizedLanguage = language.trim().toLowerCase();
  if (!plainTextLanguages.has(normalizedLanguage)) return false;

  const lines = source.split("\n");
  if (lines.length < 5) return false;

  const hasConnectors = /[│┌┐└┘├┤┬┴┼─╭╮╰╯]/.test(source) ||
    (/\|/.test(source) && /(?:_{3,}|-{3,}|\+[-+]{2,})/.test(source));
  const hasNetworkShape = /(?:internet|gateway|\bigw\b|subnet|public|private|database|\brds\b|\bec2\b)/i.test(source);

  return hasConnectors && hasNetworkShape;
}

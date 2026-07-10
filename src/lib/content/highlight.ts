import "server-only";

import { load } from "cheerio";
import { codeToHtml, type BundledLanguage } from "shiki";

const languageAliases: Record<string, BundledLanguage> = {
  console: "bash",
  docker: "dockerfile",
  dockerfile: "dockerfile",
  hcl: "hcl",
  html: "html",
  js: "javascript",
  jsx: "jsx",
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
  yml: "yaml",
  aws: "bash",
  awscli: "bash",
};

function codeLanguage(className = ""): BundledLanguage {
  const language = className.match(/language-([a-z0-9-]+)/i)?.[1]?.toLowerCase() || "text";
  return languageAliases[language] || (language as BundledLanguage);
}

function shouldShowLanguage(language: BundledLanguage) {
  return String(language).toLowerCase() !== "text";
}

export async function highlightCodeBlocks(html: string) {
  if (!html || !html.includes("<pre")) return html;

  const $ = load(html, null, false);
  const blocks = $("pre").toArray();

  for (const block of blocks) {
    const pre = $(block);
    if (pre.hasClass("shiki")) continue;

    const code = pre.find("code").first();
    if (!code.length) continue;

    const language = codeLanguage(code.attr("class"));
    const source = code.text();

    try {
      const highlighted = await codeToHtml(source, {
        lang: language,
        themes: {
          light: "github-light",
          dark: "github-dark",
        },
      });
      const fragment = load(highlighted, null, false);
      const highlightedPre = fragment("pre");
      const fileName =
        pre.attr("data-filename") ||
        pre.attr("data-file") ||
        pre.attr("data-title") ||
        code.attr("data-filename");

      highlightedPre.addClass("code-block");
      if (fileName) highlightedPre.attr("data-filename", fileName);
      if (shouldShowLanguage(language)) highlightedPre.attr("data-language", language.toUpperCase());
      pre.replaceWith(highlightedPre);
    } catch {
      pre.addClass("code-block");
      if (shouldShowLanguage(language)) pre.attr("data-language", language.toUpperCase());
    }
  }

  return $.html();
}

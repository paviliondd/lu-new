import "server-only";

import { load } from "cheerio";
import { codeToHtml } from "shiki";
import {
  formatCodeSource,
  languageFromClass,
  shouldShowLanguage,
} from "@/app/components/CodeBlock/syntax";
import { detectCodeLanguageFromSource } from "@/lib/content/detect-code-language";

export async function highlightCodeBlocks(html: string) {
  if (!html || !html.includes("<pre")) return html;

  const $ = load(html, null, false);
  const blocks = $("pre").toArray();

  for (const block of blocks) {
    const pre = $(block);
    const code = pre.find("code").first();
    if (!code.length) continue;

    const originalLanguage = (
      code.attr("data-language") ||
      pre.attr("data-language") ||
      languageFromClass(code.attr("class")) ||
      languageFromClass(pre.attr("class")) ||
      "auto"
    ).toLowerCase();
    const rawSource = code.text().replace(/\r\n?/g, "\n").replace(/\n+$/, "");

    if (originalLanguage === "mermaid") {
      pre.addClass("mermaid-source");
      pre.attr("data-language", "mermaid");
      pre.attr("data-mermaid", "true");
      continue;
    }

    const detection = detectCodeLanguageFromSource(rawSource, originalLanguage);
    const language = detection.language;
    const source = formatCodeSource(rawSource, language);

    try {
      let highlighted: string;
      try {
        highlighted = await codeToHtml(source, {
          lang: language,
          themes: {
            light: "github-light",
            dark: "dark-plus",
          },
        });
      } catch {
        highlighted = await codeToHtml(source, {
          lang: "text",
          themes: {
            light: "github-light",
            dark: "dark-plus",
          },
        });
      }
      const fragment = load(highlighted, null, false);
      const highlightedPre = fragment("pre");
      const fileName =
        pre.attr("data-filename") ||
        pre.attr("data-file") ||
        pre.attr("data-title") ||
        code.attr("data-filename");

      highlightedPre.addClass("code-block");
      highlightedPre.attr("data-line-numbers", "false");
      highlightedPre.find(".line").each((index, line) => {
        fragment(line).attr("data-line", String(index + 1));
      });
      if (fileName) highlightedPre.attr("data-filename", fileName);
      if (shouldShowLanguage(language)) highlightedPre.attr("data-language", String(language).toLowerCase());
      pre.replaceWith(highlightedPre);
    } catch {
      pre.addClass("code-block");
      if (shouldShowLanguage(language)) pre.attr("data-language", String(language).toLowerCase());
    }
  }

  return $.html();
}

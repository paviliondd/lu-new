import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import dockerfile from "highlight.js/lib/languages/dockerfile";
import go from "highlight.js/lib/languages/go";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import powershell from "highlight.js/lib/languages/powershell";
import python from "highlight.js/lib/languages/python";
import rust from "highlight.js/lib/languages/rust";
import sql from "highlight.js/lib/languages/sql";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import yaml from "highlight.js/lib/languages/yaml";

export type CodeLanguageDetectionSource = "explicit" | "heuristic" | "statistical" | "fallback";

export interface CodeLanguageDetection {
  language: string;
  source: CodeLanguageDetectionSource;
  relevance?: number;
}

const aliases: Record<string, string> = {
  docker: "dockerfile",
  js: "javascript",
  py: "python",
  sh: "bash",
  shell: "bash",
  tf: "terraform",
  ts: "typescript",
  txt: "text",
  yml: "yaml",
  zsh: "bash",
};

const plaintextAliases = new Set(["plain", "plaintext", "text", "txt"]);

const statisticalLanguages = [
  ["javascript", javascript],
  ["typescript", typescript],
  ["python", python],
  ["bash", bash],
  ["powershell", powershell],
  ["yaml", yaml],
  ["json", json],
  ["go", go],
  ["rust", rust],
  ["sql", sql],
  ["dockerfile", dockerfile],
  ["html", xml],
] as const;

for (const [name, grammar] of statisticalLanguages) {
  hljs.registerLanguage(name, grammar);
}

function normalizeExplicitLanguage(value = "") {
  const normalized = value.trim().toLowerCase();
  if (!normalized || normalized === "auto") return "";
  if (plaintextAliases.has(normalized)) return "text";
  if (normalized === "hcl") return "hcl";
  return aliases[normalized] || normalized;
}

export function heuristicDetectCodeLanguage(code: string): string | null {
  const source = code.replace(/\r\n?/g, "\n");

  if (/^#!.*(?:powershell|pwsh)/im.test(source) || /\b(?:Write-Host|Get-[A-Z]\w*|Set-[A-Z]\w*|Invoke-[A-Z]\w*)\b/.test(source)) {
    return "powershell";
  }
  const hclBlock = /^\s*(?:resource|variable|module|provider|terraform|data|locals|output)\s+(?:"[^"]+"\s*)*\{/m.test(source);
  const hclAttributes = source.match(/^\s*(?:ami|instance_type|region|source|version)\s*=\s*\S+/gm) || [];
  if (hclBlock || hclAttributes.length >= 2) {
    return "hcl";
  }
  if (/^#!\s*\/[^\n]*(?:bash|sh|zsh)\b/m.test(source) ||
      /^\s*(?:echo|export|chmod|sudo|apt(?:-get)?|yum|curl|wget|grep|awk|sed|cat|cd|ls|mkdir|rm|cp|mv|tar|ssh|scp|npm|npx|pnpm|yarn)\b/m.test(source) ||
      /^\s*source\s+[^=\n]/m.test(source) ||
      /^\s*(?:if|then|else|fi|for|do|done|while|case|esac)\b/m.test(source) ||
      /^\s*\w+\s*=\s*[^\n]+\n\s*(?:echo|export|source|if|for|while)\b/m.test(source) ||
      /[|&;]\s*(?:grep|awk|sed|sort|uniq|head|tail|xargs)\b/m.test(source)) {
    return "bash";
  }
  if (/^\s*FROM\s+\S+/m.test(source) && /^\s*(?:RUN|CMD|ENTRYPOINT|COPY|ADD|ENV|EXPOSE|WORKDIR)\s+/m.test(source)) {
    return "dockerfile";
  }
  if (/^\s*(?:SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|WITH)\s+/im.test(source) &&
      /\b(?:FROM|WHERE|JOIN|GROUP\s+BY|ORDER\s+BY|LIMIT)\b/i.test(source)) {
    return "sql";
  }
  if (/^\s*package\s+\w+/m.test(source) && (/^\s*func\s+\w+/m.test(source) || /:=/.test(source))) {
    return "go";
  }
  if (/^\s*fn\s+\w+/m.test(source) && (/\blet\s+mut\b/.test(source) || /\buse\s+\w+::/.test(source))) {
    return "rust";
  }
  if (/^\s*(?:def|class)\s+\w+/m.test(source) || /^\s*from\s+\w[\w.]*\s+import\s+/m.test(source)) {
    return "python";
  }
  if (/^\s*(?:interface\s+\w+|type\s+\w+\s*=)/m.test(source) || /:\s*(?:string|number|boolean|unknown)\b/.test(source)) {
    return "typescript";
  }
  if (/^\s*(?:const|let|var)\s+\w+\s*=\s*(?:require\(|async\b|await\b)/m.test(source) || /\bconsole\.log\s*\(/.test(source)) {
    return "javascript";
  }
  if (/^\s*<\?xml\s+version/im.test(source) || /<\w+[\s\S]*\sxmlns(?::\w+)?=/.test(source)) {
    return "xml";
  }
  if (/<!doctype\s+html>/i.test(source) || /<html(?:\s|>)/i.test(source) || /<\/(?:div|span|p|body|head)>/i.test(source)) {
    return "html";
  }
  if (/^\s*[\[{]/.test(source)) {
    try {
      JSON.parse(source);
      return "json";
    } catch {
      // Continue to indentation-sensitive YAML checks.
    }
  }

  const yamlSignature = /^(?:apiVersion|kind|metadata|spec|services|volumes|environment|ports):\s*/m.test(source) ||
    /^---\s*$/m.test(source) ||
    /^\s*-\s+[\w.-]+:\s+/m.test(source) ||
    /^\s*[\w.-]+:\s*\n\s{2,}[\w.-]+:\s*/m.test(source);
  if (yamlSignature) return "yaml";

  return null;
}

export function detectCodeLanguageFromSource(code: string, explicitLanguage = ""): CodeLanguageDetection {
  const explicit = normalizeExplicitLanguage(explicitLanguage);
  if (explicit) return { language: explicit, source: "explicit" };

  const heuristic = heuristicDetectCodeLanguage(code);
  if (heuristic) return { language: heuristic, source: "heuristic" };

  const result = hljs.highlightAuto(code, statisticalLanguages.map(([name]) => name));
  if (result.language && result.relevance >= 5) {
    return {
      language: aliases[result.language] || result.language,
      relevance: result.relevance,
      source: "statistical",
    };
  }

  return { language: "text", source: "fallback" };
}

import { load } from "cheerio";

export function normalizeExcerpt(value: unknown, fallback = "") {
  let normalized =
    typeof value === "string" && value.trim()
      ? value.trim()
      : fallback.trim();

  for (let pass = 0; pass < 3; pass += 1) {
    const decoded = load(normalized, null, false).text();
    if (decoded === normalized) break;
    normalized = decoded;
  }

  return normalized.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

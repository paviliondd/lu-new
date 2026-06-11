import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { XMLParser } from "fast-xml-parser";

const args = process.argv.slice(2);

function getArg(name, fallback = "") {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] || fallback : fallback;
}

const sourcePath = path.resolve(getArg("--source", args[0] || ""));
const outputPath = path.resolve(
  getArg("--output", sourcePath.replace(/\.xml$/i, ".normalized.xml"))
);
const publicDirectory = path.resolve(
  getArg("--public-dir", path.join(process.cwd(), "public", "images", "imported"))
);
const publicPrefix = getArg("--public-prefix", "/images/imported").replace(/\/$/, "");
const baseUrl = getArg("--base-url", process.env.IMPORT_SOURCE_URL || "");
const shouldDownload = !args.includes("--no-download");

if (!sourcePath || !sourcePath.toLowerCase().endsWith(".xml")) {
  throw new Error(
    "Usage: node scripts/normalize-xml-images.mjs --source <export.xml> [--base-url https://old-site.example.com]"
  );
}

function decodeXmlUrl(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&#038;", "&")
    .replaceAll("&#38;", "&");
}

function toAbsoluteUrl(value) {
  const decoded = decodeXmlUrl(value.trim());
  if (/^https?:\/\//i.test(decoded)) return decoded;
  if (decoded.startsWith("//")) return `https:${decoded}`;
  if (baseUrl && decoded.startsWith("/")) return new URL(decoded, baseUrl).toString();
  return "";
}

function looksLikeImage(value) {
  return /\.(avif|gif|jpe?g|png|svg|webp)(?:[?#].*)?$/i.test(value);
}

function collectCandidates(parsedXml) {
  const candidates = new Map();
  const attributePattern =
    /\b(?:src|data-src|data-lazy-src|data-original|poster)=["']([^"']+)["']/gi;
  const sourceSetPattern = /\b(?:srcset|data-srcset)=["']([^"']+)["']/gi;
  const directUrlPattern =
    /(?:https?:\/\/|\/\/|\/)[^\s"'<>]+?\.(?:avif|gif|jpe?g|png|svg|webp)(?:[?#][^\s"'<>]*)?/gi;

  function inspectText(text) {
    let match;
    while ((match = attributePattern.exec(text)) !== null) {
      const raw = match[1].trim();
      const url = toAbsoluteUrl(raw);
      if (url && looksLikeImage(url)) candidates.set(raw, url);
    }

    let sourceSetMatch;
    while ((sourceSetMatch = sourceSetPattern.exec(text)) !== null) {
      for (const candidate of sourceSetMatch[1].split(",")) {
        const raw = candidate.trim().split(/\s+/)[0];
        const url = toAbsoluteUrl(raw);
        if (url && looksLikeImage(url)) candidates.set(raw, url);
      }
    }

    for (const directMatch of text.matchAll(directUrlPattern)) {
      const raw = directMatch[0].trim();
      const url = toAbsoluteUrl(raw);
      if (url && looksLikeImage(url)) candidates.set(raw, url);
    }
  }

  function walk(value) {
    if (typeof value === "string") {
      inspectText(value);
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }

    if (value && typeof value === "object") {
      Object.values(value).forEach(walk);
    }
  }

  walk(parsedXml);
  return candidates;
}

function safeFileName(url, contentType) {
  const parsedUrl = new URL(url);
  const originalName = path.basename(parsedUrl.pathname) || "image";
  const extensionFromUrl = path.extname(originalName).toLowerCase();
  const extensionByType = {
    "image/avif": ".avif",
    "image/gif": ".gif",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/svg+xml": ".svg",
    "image/webp": ".webp",
  };
  const extension = extensionFromUrl || extensionByType[contentType] || ".img";
  const stem = path
    .basename(originalName, extensionFromUrl)
    .replace(/[^a-z0-9_-]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72) || "image";
  const hash = crypto.createHash("sha1").update(url).digest("hex").slice(0, 10);
  return `${stem}-${hash}${extension}`;
}

async function downloadImage(url) {
  const response = await fetch(url, {
    headers: { "user-agent": "LinuxUnity XML image importer/1.0" },
    redirect: "follow",
  });
  const contentType = response.headers.get("content-type")?.split(";")[0] || "";

  if (!response.ok || !contentType.startsWith("image/")) {
    throw new Error(`HTTP ${response.status}, content-type: ${contentType || "unknown"}`);
  }

  const fileName = safeFileName(url, contentType);
  const destination = path.join(publicDirectory, fileName);
  await fs.writeFile(destination, Buffer.from(await response.arrayBuffer()));
  return `${publicPrefix}/${fileName}`;
}

async function updateImageHostManifest(origins) {
  const manifestPath = path.join(process.cwd(), "content", "image-hosts.json");
  let current = [];

  try {
    current = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  } catch {
    current = [];
  }

  const next = [...new Set([...current, ...origins])].sort();
  await fs.writeFile(manifestPath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
}

async function main() {
  const xml = await fs.readFile(sourcePath, "utf8");
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    textNodeName: "#text",
    cdataPropName: "#cdata",
    processEntities: false,
    preserveOrder: true,
    trimValues: false,
  });

  const parsedXml = parser.parse(xml);
  const candidates = collectCandidates(parsedXml);
  const replacements = new Map();
  const unresolvedOrigins = new Set();

  await fs.mkdir(publicDirectory, { recursive: true });

  for (const [rawValue, url] of candidates) {
    if (!shouldDownload) {
      unresolvedOrigins.add(new URL(url).origin);
      continue;
    }

    try {
      const localPath = await downloadImage(url);
      replacements.set(rawValue, localPath);
      console.log(`downloaded ${url} -> ${localPath}`);
    } catch (error) {
      unresolvedOrigins.add(new URL(url).origin);
      console.warn(`kept remote ${url}: ${error.message}`);
    }
  }

  let normalizedXml = xml;
  for (const [source, destination] of replacements) {
    normalizedXml = normalizedXml.replaceAll(source, destination);
  }

  await fs.writeFile(outputPath, normalizedXml, "utf8");
  await updateImageHostManifest(unresolvedOrigins);

  console.log("");
  console.log(`XML validated: ${sourcePath}`);
  console.log(`Image URLs found: ${candidates.size}`);
  console.log(`Images localized: ${replacements.size}`);
  console.log(`Remote image origins retained: ${unresolvedOrigins.size}`);
  console.log(`Normalized XML: ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

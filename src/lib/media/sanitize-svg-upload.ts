const BLOCKED_ELEMENTS = /<(?:script|foreignObject|iframe|object|embed|audio|video|canvas|set|animate(?:Color|Motion|Transform)?)[\s\S]*?<\/(?:script|foreignObject|iframe|object|embed|audio|video|canvas|set|animate(?:Color|Motion|Transform)?)\s*>/gi;
const BLOCKED_SELF_CLOSING_ELEMENTS = /<(?:script|foreignObject|iframe|object|embed|audio|video|canvas|set|animate(?:Color|Motion|Transform)?)(?:\s[^>]*)?\/?\s*>/gi;
const EVENT_HANDLER_ATTRIBUTES = /\s(?:on[a-z][\w:-]*)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const UNSAFE_REFERENCE_ATTRIBUTES = /\s(?:href|xlink:href)\s*=\s*(?:"\s*(?:javascript:|data:|https?:|\/\/)[^"]*"|'\s*(?:javascript:|data:|https?:|\/\/)[^']*'|\s*(?:javascript:|data:|https?:|\/\/)[^\s>]+)/gi;
const XML_DANGEROUS_DECLARATIONS = /<!\s*(?:doctype|entity)\b[^>]*(?:\[[\s\S]*?\]\s*)?>/gi;

/**
 * Removes active content from SVG markup before it is written to local media
 * storage. SVGs are user-supplied XML and must not be treated like bitmap
 * images. This intentionally permits only inert vector markup and local #id
 * references; external/data/javascript references and animation are removed.
 */
export function sanitizeSvgUpload(source: string): string {
  const normalized = source.replace(/^\uFEFF/, "").replace(/^<\?xml[^>]*\?>\s*/i, "").trim();
  if (!/^<svg\b[^>]*>/i.test(normalized) || !/<\/svg\s*>\s*$/i.test(normalized)) {
    throw new Error("Uploaded file is not a valid SVG document.");
  }

  const sanitized = normalized
    .replace(XML_DANGEROUS_DECLARATIONS, "")
    .replace(BLOCKED_ELEMENTS, "")
    .replace(BLOCKED_SELF_CLOSING_ELEMENTS, "")
    .replace(EVENT_HANDLER_ATTRIBUTES, "")
    .replace(UNSAFE_REFERENCE_ATTRIBUTES, "");

  if (!/^<svg\b[^>]*>/i.test(sanitized) || !/<\/svg\s*>\s*$/i.test(sanitized)) {
    throw new Error("Uploaded file is not a valid SVG document.");
  }

  return sanitized;
}

export interface UploadFileLike {
  data: Buffer;
  mimetype?: string | null;
  name?: string | null;
}

export function isSvgUpload(file: UploadFileLike | undefined): file is UploadFileLike {
  if (!file?.data) return false;
  return file.mimetype?.toLowerCase().split(";", 1)[0] === "image/svg+xml" || /\.svg$/i.test(file.name || "");
}

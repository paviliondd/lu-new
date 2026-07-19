type MediaDocument = Record<string, unknown>;

function asMediaDocument(value: unknown): MediaDocument | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as MediaDocument)
    : null;
}

function asURL(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function legacyImportedMediaURL(value: unknown): string | null {
  const doc = asMediaDocument(value);
  const thumbnailURL = asURL(doc?.thumbnailURL);
  return thumbnailURL?.startsWith("/uploads/imported/") ? thumbnailURL : null;
}

export function preferredMediaURL(value: unknown): string | null {
  const doc = asMediaDocument(value);
  if (!doc) return null;

  const legacyURL = legacyImportedMediaURL(doc);
  if (legacyURL) return legacyURL;

  const sizes = asMediaDocument(doc.sizes);
  const sized = asMediaDocument(sizes?.og) || asMediaDocument(sizes?.card);
  return asURL(sized?.url) || asURL(doc.url);
}

import config from "@payload-config";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import {
  REST_DELETE,
  REST_GET,
  REST_OPTIONS,
  REST_PATCH,
  REST_POST,
  REST_PUT,
} from "@payloadcms/next/routes";

const payloadGET = REST_GET(config);

function requestedMediaFilename(request: Request) {
  const prefix = "/api/payload/media/file/";
  const pathname = new URL(request.url).pathname;
  if (!pathname.startsWith(prefix)) return null;

  try {
    const mediaFilename = decodeURIComponent(pathname.slice(prefix.length));
    if (
      !mediaFilename ||
      mediaFilename !== path.posix.basename(mediaFilename) ||
      mediaFilename !== path.win32.basename(mediaFilename) ||
      mediaFilename.includes("\0")
    ) {
      return null;
    }
    return mediaFilename;
  } catch {
    return null;
  }
}

function mediaContentType(mediaFilename: string) {
  const extension = path.extname(mediaFilename).toLowerCase();
  return ({
    ".avif": "image/avif",
    ".gif": "image/gif",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
  } as Record<string, string>)[extension] || "application/octet-stream";
}

async function legacyImportedMediaResponse(mediaFilename: string) {
  const filePath = path.join(process.cwd(), "public", "uploads", "imported", mediaFilename);
  try {
    const fileStats = await stat(filePath);
    if (!fileStats.isFile()) return null;

    const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream<Uint8Array>;
    return new Response(stream, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": String(fileStats.size),
        "Content-Type": mediaContentType(mediaFilename),
      },
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

export const DELETE = REST_DELETE(config);
export async function GET(...args: Parameters<typeof payloadGET>) {
  const payloadResponse = await payloadGET(...args);
  if (payloadResponse.status !== 404) return payloadResponse;

  const mediaFilename = requestedMediaFilename(args[0]);
  if (!mediaFilename) return payloadResponse;

  return (await legacyImportedMediaResponse(mediaFilename)) || payloadResponse;
}
export const OPTIONS = REST_OPTIONS(config);
export const PATCH = REST_PATCH(config);
export const POST = REST_POST(config);
export const PUT = REST_PUT(config);

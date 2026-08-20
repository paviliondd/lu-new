import "server-only";

import { headers } from "next/headers";
import config from "@payload-config";
import { getPayload } from "payload";

/**
 * Draft content is visible only to an authenticated Payload Admin user. A
 * public `preview=true` parameter must never grant access by itself.
 */
export async function canPreviewPayloadDraft() {
  if (!process.env.DATABASE_URL || !process.env.PAYLOAD_SECRET) return false;

  try {
    const payload = await getPayload({ config });
    const { user } = await payload.auth({ headers: await headers() });
    return Boolean(user);
  } catch (error) {
    console.warn("Unable to verify Payload Admin session for draft preview", { error });
    return false;
  }
}

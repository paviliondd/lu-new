import { NextResponse } from "next/server";
import { addComment, getComments } from "@/lib/comments/store";
import { addPendingPayloadComment, getApprovedPayloadComments } from "@/lib/cms/payload";
import { getCurrentUser } from "@/lib/auth/session";
import { rateLimit } from "@/lib/server/rate-limit";

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug") || "";
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const comments = (await getApprovedPayloadComments(slug)) || (await getComments(slug));
  return NextResponse.json({ comments });
}

export async function POST(request: Request) {
  const limited = rateLimit(request, {
    key: "comments",
    limit: 5,
    windowMs: 10 * 60_000,
  });
  if (limited) return limited;

  const payload = await request.json().catch(() => null);
  if (!payload || payload.website) {
    return NextResponse.json({ error: "Invalid comment" }, { status: 400 });
  }

  const postSlug = String(payload.postSlug || "").trim();
  const body = String(payload.body || "").trim();
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  if (!postSlug || body.length < 2) {
    return NextResponse.json({ error: "Comment is required" }, { status: 400 });
  }

  const comment =
    (await addPendingPayloadComment({
      postSlug,
      parentId: payload.parentId ? String(payload.parentId) : null,
      user,
      body,
    })) ||
    (await addComment({
      postSlug,
      parentId: payload.parentId ? String(payload.parentId) : null,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatar,
      body,
    }));

  return NextResponse.json({ comment, pendingApproval: true }, { status: 201 });
}

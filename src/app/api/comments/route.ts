import { NextResponse } from "next/server";
import { addComment, getComments } from "@/lib/comments/store";
import { rateLimit } from "@/lib/server/rate-limit";

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug") || "";
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const comments = await getComments(slug);
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
  const name = String(payload.name || "").trim();
  if (!postSlug || body.length < 2 || name.length < 2) {
    return NextResponse.json({ error: "Name and comment are required" }, { status: 400 });
  }

  const comment = await addComment({
    postSlug,
    parentId: payload.parentId ? String(payload.parentId) : null,
    name,
    avatarUrl: payload.avatarUrl ? String(payload.avatarUrl) : null,
    body,
  });

  return NextResponse.json({ comment }, { status: 201 });
}

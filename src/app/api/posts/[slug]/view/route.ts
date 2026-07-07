import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { incrementPayloadPostView } from "@/lib/cms/payload";
import { rateLimit } from "@/lib/server/rate-limit";
import { invalidateCache } from "@/lib/server/redis-cache";
import {
  hasRecentViewSession,
  incrementLocalPostView,
  rememberViewSession,
} from "@/lib/views/store";

interface ViewRouteProps {
  params: Promise<{ slug: string }>;
}

const viewCookieMaxAge = 60 * 60 * 24;

function clientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    forwardedFor ||
    "unknown"
  );
}

function cookieValue(request: Request, name: string) {
  const cookie = request.headers.get("cookie") || "";
  return cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function viewSessionKey(request: Request, slug: string) {
  const fingerprint = [
    slug,
    clientIp(request),
    request.headers.get("user-agent") || "unknown",
    request.headers.get("accept-language") || "",
  ].join("|");

  return crypto.createHash("sha256").update(fingerprint).digest("hex");
}

function cookieName(slug: string) {
  return `lu_view_${crypto.createHash("sha1").update(slug).digest("hex").slice(0, 16)}`;
}

function isCrawlerOrPrefetch(request: Request) {
  const userAgent = request.headers.get("user-agent") || "";
  const purpose = `${request.headers.get("purpose") || ""} ${request.headers.get("sec-purpose") || ""}`;

  return (
    /\b(bot|crawler|spider|slurp|preview|facebookexternalhit|whatsapp|telegrambot|linkedinbot|embedly|quora link preview)\b/i.test(
      userAgent
    ) ||
    /\bprefetch\b/i.test(purpose) ||
    request.headers.get("next-router-prefetch") === "1"
  );
}

function duplicateResponse(reason: string) {
  return NextResponse.json({
    counted: false,
    reason,
  });
}

export async function POST(request: Request, { params }: ViewRouteProps) {
  const { slug } = await params;
  const limited = rateLimit(request, {
    key: `post-view:${slug}`,
    limit: 5,
    windowMs: 60_000,
  });
  if (limited) return limited;

  if (isCrawlerOrPrefetch(request)) {
    return duplicateResponse("ignored-crawler-or-prefetch");
  }

  const currentCookieName = cookieName(slug);
  if (cookieValue(request, currentCookieName)) {
    return duplicateResponse("recent-cookie");
  }

  const sessionKey = viewSessionKey(request, slug);
  if (await hasRecentViewSession(sessionKey)) {
    const response = duplicateResponse("recent-session");
    response.cookies.set(currentCookieName, "1", {
      httpOnly: true,
      maxAge: viewCookieMaxAge,
      path: `/`,
      sameSite: "lax",
    });
    return response;
  }

  async function recordLocalView() {
    const views = await incrementLocalPostView(slug);
    await rememberViewSession(sessionKey);
    await invalidateCache(["posts:published:*", "posts:detail:*"]);
    const response = NextResponse.json({ views, counted: true });
    response.cookies.set(currentCookieName, "1", {
      httpOnly: true,
      maxAge: viewCookieMaxAge,
      path: `/`,
      sameSite: "lax",
    });
    return response;
  }

  try {
    const views = await incrementPayloadPostView(slug);
    if (views === null) return recordLocalView();
    await invalidateCache(["posts:published:*", "posts:detail:*"]);
    await rememberViewSession(sessionKey);

    const nextResponse = NextResponse.json({
      views,
      counted: true,
    });
    nextResponse.cookies.set(currentCookieName, "1", {
      httpOnly: true,
      maxAge: viewCookieMaxAge,
      path: `/`,
      sameSite: "lax",
    });

    return nextResponse;
  } catch (error) {
    console.error("Unable to record Payload post view", { slug, error });
    return recordLocalView();
  }
}

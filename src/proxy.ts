import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale } from "@/i18n/config";

const reservedSegments = new Set([
  "about",
  "blog",
  "feed.xml",
  "rss.xml",
  "search",
  "team",
  "wp-admin",
  "wp-content",
  "wp-includes",
  "wp-json",
  "xmlrpc.php",
]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);
  const hasEnglishPrefix = pathname === "/en" || pathname.startsWith("/en/");
  const hasVietnamesePrefix = pathname === "/vi" || pathname.startsWith("/vi/");

  if (hasEnglishPrefix || hasVietnamesePrefix) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = pathname.replace(/^\/(?:en|vi)(?=\/|$)/, "") || "/";
    return NextResponse.redirect(redirectUrl, 308);
  }

  const rewriteUrl = request.nextUrl.clone();
  const isWordPressPostPermalink =
    request.method === "GET" &&
    segments.length === 1 &&
    !reservedSegments.has(segments[0]);

  rewriteUrl.pathname = isWordPressPostPermalink
    ? `/${defaultLocale}/blog/${segments[0]}`
    : `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(rewriteUrl);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|images|.*\\.[a-zA-Z0-9]+$).*)",
  ],
};

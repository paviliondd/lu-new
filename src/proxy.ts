import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, locales } from "@/i18n/config";

const reservedSegments = new Set([
  "about",
  "blog",
  "team",
  "wp-admin",
  "wp-content",
  "wp-includes",
  "wp-json",
  "xmlrpc.php",
]);

function preferredLocale(request: NextRequest) {
  const savedLocale = request.cookies.get("linuxunity-locale")?.value;
  if (savedLocale && locales.includes(savedLocale as (typeof locales)[number])) {
    return savedLocale;
  }

  const acceptedLanguages = request.headers.get("accept-language")?.toLowerCase() || "";
  return acceptedLanguages.startsWith("en") ? "en" : defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);
  const hasLocalePrefix = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (hasLocalePrefix) {
    return NextResponse.next();
  }

  const locale = preferredLocale(request);
  const redirectUrl = request.nextUrl.clone();
  const isWordPressPostPermalink =
    request.method === "GET" &&
    segments.length === 1 &&
    !reservedSegments.has(segments[0]);

  redirectUrl.pathname = isWordPressPostPermalink
    ? `/${locale}/blog/${segments[0]}`
    : `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|images|.*\\.[a-zA-Z0-9]+$).*)",
  ],
};

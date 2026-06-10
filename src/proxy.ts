import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, locales } from "@/i18n/config";

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
  const hasLocalePrefix = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (hasLocalePrefix) {
    return NextResponse.next();
  }

  const locale = preferredLocale(request);
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|images|.*\\.[a-zA-Z0-9]+$).*)",
  ],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale } from "@/i18n/config";

const reservedSegments = new Set([
  "about",
  "admin",
  "blog",
  "feed.xml",
  "rss.xml",
  "search",
  "team",
  "projects",
]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host")?.split(":")[0].toLowerCase();
  const projectDomain = (process.env.PROJECT_DOMAIN || "project.linuxunity.com").toLowerCase();

  if (hostname === projectDomain || hostname === "project.localhost") {
    if (pathname === "/") {
      const projectUrl = request.nextUrl.clone();
      projectUrl.pathname = "/projects";
      return NextResponse.rewrite(projectUrl);
    }
    if (pathname === "/projects") {
      const projectUrl = request.nextUrl.clone();
      projectUrl.pathname = "/";
      return NextResponse.redirect(projectUrl, 308);
    }
    if (pathname.startsWith("/projects/")) {
      const projectUrl = request.nextUrl.clone();
      projectUrl.pathname = pathname.replace(/^\/projects/, "");
      return NextResponse.redirect(projectUrl, 308);
    }
    if (request.method === "GET" && pathname.split("/").filter(Boolean).length === 1) {
      const projectUrl = request.nextUrl.clone();
      projectUrl.pathname = `/projects${pathname}`;
      return NextResponse.rewrite(projectUrl);
    }
    return NextResponse.next();
  }

  const siteDomain = (process.env.SITE_DOMAIN || "linuxunity.com").toLowerCase();
  const wwwDomain = (process.env.SITE_WWW_DOMAIN || `www.${siteDomain}`).toLowerCase();
  if ((hostname === siteDomain || hostname === wwwDomain) && (pathname === "/projects" || pathname.startsWith("/projects/"))) {
    const projectUrl = request.nextUrl.clone();
    projectUrl.protocol = "https";
    projectUrl.hostname = projectDomain;
    projectUrl.port = "";
    projectUrl.pathname = pathname === "/projects" ? "/" : pathname.replace(/^\/projects/, "");
    return NextResponse.redirect(projectUrl, 308);
  }
  const segments = pathname.split("/").filter(Boolean);
  const hasEnglishPrefix = pathname === "/en" || pathname.startsWith("/en/");
  const hasVietnamesePrefix = pathname === "/vi" || pathname.startsWith("/vi/");

  if (hasEnglishPrefix) {
    return NextResponse.next();
  }

  if (hasVietnamesePrefix) {
    // The default locale is also rewritten internally to `/vi`. Redirecting
    // this path back to `/` makes the proxy re-enter that rewrite and loops.
    return NextResponse.next();
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return NextResponse.next();
  }

  const rewriteUrl = request.nextUrl.clone();
  const isLegacyPostPermalink =
    request.method === "GET" &&
    segments.length === 1 &&
    !reservedSegments.has(segments[0]);

  rewriteUrl.pathname = isLegacyPostPermalink
    ? `/${defaultLocale}/blog/${segments[0]}`
    : `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(rewriteUrl);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|images|.*\\.[a-zA-Z0-9]+$).*)",
  ],
};

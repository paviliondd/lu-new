import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { hasLocale, locales, type Locale } from "@/i18n/config";
import { invalidateCache } from "@/lib/server/redis-cache";

function authorized(request: Request) {
  const secret = process.env.NEXT_REVALIDATE_SECRET;
  if (!secret) return false;

  return (
    request.headers.get("x-revalidate-secret") === secret ||
    new URL(request.url).searchParams.get("secret") === secret
  );
}

function revalidateLocalePaths(locale: Locale, slug?: string, seriesSlug?: string) {
  revalidatePath(`/${locale}`);
  revalidatePath(`/${locale}/blog`);
  revalidatePath(`/${locale}/blog/series`);
  revalidatePath(`/${locale}/feed.xml`);

  if (slug) {
    revalidatePath(`/${locale}/blog/${slug}`);
    revalidatePath(`/blog/${slug}`);
    revalidatePath(`/${slug}`);
  }

  if (seriesSlug) {
    revalidatePath(`/${locale}/blog/series/${seriesSlug}`);
  }
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => ({}));
  const slug = typeof payload.slug === "string" ? payload.slug : undefined;
  const seriesSlug = typeof payload.seriesSlug === "string" ? payload.seriesSlug : undefined;
  const lang = typeof payload.lang === "string" && hasLocale(payload.lang) ? payload.lang : null;

  if (lang) {
    revalidateLocalePaths(lang, slug, seriesSlug);
  } else {
    locales.forEach((locale) => revalidateLocalePaths(locale, slug, seriesSlug));
  }

  await invalidateCache([
    "posts:published:*",
    "posts:detail:*",
    "series:list:*",
    "sidebar:*",
    "search:*",
  ]);

  revalidatePath("/sitemap.xml");

  return NextResponse.json({
    revalidated: true,
    slug: slug || null,
    seriesSlug: seriesSlug || null,
    lang: lang || "all",
  });
}

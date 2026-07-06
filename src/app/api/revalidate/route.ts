import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { hasLocale, locales, type Locale } from "@/i18n/config";

function authorized(request: Request) {
  const secret = process.env.NEXT_REVALIDATE_SECRET;
  if (!secret) return false;

  return (
    request.headers.get("x-revalidate-secret") === secret ||
    new URL(request.url).searchParams.get("secret") === secret
  );
}

function revalidateLocalePaths(locale: Locale, slug?: string) {
  revalidatePath(`/${locale}`);
  revalidatePath(`/${locale}/blog`);
  revalidatePath(`/${locale}/blog/series`);
  revalidatePath(`/${locale}/feed.xml`);

  if (slug) {
    revalidatePath(`/${locale}/blog/${slug}`);
    revalidatePath(`/blog/${slug}`);
    revalidatePath(`/${slug}`);
  }
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => ({}));
  const slug = typeof payload.slug === "string" ? payload.slug : undefined;
  const lang = typeof payload.lang === "string" && hasLocale(payload.lang) ? payload.lang : null;

  if (lang) {
    revalidateLocalePaths(lang, slug);
  } else {
    locales.forEach((locale) => revalidateLocalePaths(locale, slug));
  }

  revalidatePath("/sitemap.xml");

  return NextResponse.json({
    revalidated: true,
    slug: slug || null,
    lang: lang || "all",
  });
}

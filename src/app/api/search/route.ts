import { NextResponse } from "next/server";
import { defaultLocale, hasLocale } from "@/i18n/config";
import { searchPosts } from "@/lib/search/posts";
import { rateLimit } from "@/lib/server/rate-limit";

export async function GET(request: Request) {
  const limited = rateLimit(request, {
    key: "search",
    limit: 60,
    windowMs: 60_000,
  });
  if (limited) return limited;

  const url = new URL(request.url);
  const query = url.searchParams.get("q") || "";
  const requestedLocale = url.searchParams.get("locale") || defaultLocale;
  const locale = hasLocale(requestedLocale) ? requestedLocale : defaultLocale;
  const limit = Math.min(20, Math.max(1, Number(url.searchParams.get("limit") || 8)));

  const results = await searchPosts(locale, query, limit);
  return NextResponse.json({
    query,
    locale,
    results: results.map(({ post, score, excerpt }) => ({
      slug: post.slug,
      title: post.title,
      description: post.description,
      category: post.category,
      tags: post.tags,
      date: post.date,
      views: post.views,
      score,
      excerpt,
    })),
  });
}

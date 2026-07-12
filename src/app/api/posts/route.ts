import { getCmsPublishedPosts } from "@/lib/cms/payload";
import { defaultLocale, hasLocale } from "@/i18n/config";
import { rateLimit } from "@/lib/server/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const limited = rateLimit(request, {
    key: "api-posts",
    limit: 120,
    windowMs: 60_000,
  });
  if (limited) return limited;

  const requestedLocale = new URL(request.url).searchParams.get("locale") || defaultLocale;
  const locale = hasLocale(requestedLocale) ? requestedLocale : defaultLocale;
  const requestedLimit = Number(new URL(request.url).searchParams.get("limit") || "100");
  const posts = await getCmsPublishedPosts(locale, requestedLimit);
  return Response.json(
    {
      docs: posts.map((post) => ({
        ...post,
        cover: post.seo.ogImage || post.thumbnail || null,
      })),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

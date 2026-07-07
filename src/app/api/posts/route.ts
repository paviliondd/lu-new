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
  const posts = await getCmsPublishedPosts(locale);
  return Response.json(posts);
}

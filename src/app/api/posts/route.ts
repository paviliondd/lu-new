import { getCmsPublishedPosts } from "@/lib/cms/wordpress";
import { defaultLocale, hasLocale } from "@/i18n/config";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestedLocale = new URL(request.url).searchParams.get("locale") || defaultLocale;
  const locale = hasLocale(requestedLocale) ? requestedLocale : defaultLocale;
  const posts = await getCmsPublishedPosts(locale);
  return Response.json(posts);
}

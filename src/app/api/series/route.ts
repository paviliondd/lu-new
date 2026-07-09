import { getCmsSeries } from "@/lib/cms/payload";
import { hasLocale, type Locale } from "@/i18n/config";
import { rateLimit } from "@/lib/server/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const limited = rateLimit(request, {
    key: "api-series",
    limit: 60,
    windowMs: 60_000,
  });
  if (limited) return limited;

  const localeParam = new URL(request.url).searchParams.get("locale") || "vi";
  const locale: Locale = hasLocale(localeParam) ? localeParam : "vi";
  const series = await getCmsSeries(locale);
  return Response.json(series);
}

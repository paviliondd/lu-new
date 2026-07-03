import { NextResponse } from "next/server";
import { fetchWordPressRest } from "@/lib/cms/wordpress-rest";
import { rateLimit } from "@/lib/server/rate-limit";

interface ViewRouteProps {
  params: Promise<{ slug: string }>;
}

export async function POST(request: Request, { params }: ViewRouteProps) {
  const { slug } = await params;
  const limited = rateLimit(request, {
    key: `post-view:${slug}`,
    limit: 5,
    windowMs: 60_000,
  });
  if (limited) return limited;

  try {
    const response = await fetchWordPressRest(
      `/linuxunity/v1/posts/${encodeURIComponent(slug)}/view`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
        },
        cache: "no-store",
      }
    );

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(payload, { status: response.status });
    }

    return NextResponse.json({
      views: Math.max(0, Number(payload.views || 0)),
    });
  } catch {
    return NextResponse.json({ error: "Unable to record view" }, { status: 502 });
  }
}

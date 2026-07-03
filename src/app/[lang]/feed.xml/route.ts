import { NextResponse } from "next/server";
import { getCmsPublishedPosts } from "@/lib/cms/wordpress";
import { hasLocale } from "@/i18n/config";
import { siteUrl } from "@/i18n/metadata";

interface FeedRouteProps {
  params: Promise<{ lang: string }>;
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function absoluteUrl(pathname: string) {
  return `${siteUrl}${pathname}`;
}

export async function GET(_request: Request, { params }: FeedRouteProps) {
  const { lang } = await params;
  if (!hasLocale(lang)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const posts = await getCmsPublishedPosts(lang);
  const title = lang === "vi" ? "LinuxUnity Blog" : "LinuxUnity Blog";
  const description =
    lang === "vi"
      ? "Bai viet moi nhat tu LinuxUnity."
      : "Latest articles from LinuxUnity.";
  const link = absoluteUrl(`/${lang}/blog`);

  const items = posts
    .map((post) => {
      const postUrl = absoluteUrl(`/${lang}/blog/${post.slug}`);
      const pubDate = post.date ? new Date(post.date).toUTCString() : new Date().toUTCString();

      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(postUrl)}</link>
      <guid isPermaLink="true">${escapeXml(postUrl)}</guid>
      <description>${escapeXml(post.description || post.title)}</description>
      <pubDate>${escapeXml(pubDate)}</pubDate>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(link)}</link>
    <description>${escapeXml(description)}</description>
    <language>${lang === "vi" ? "vi-VN" : "en-US"}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}

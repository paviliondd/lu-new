import type { MetadataRoute } from "next";
import { getCmsPublishedPosts } from "@/lib/cms/wordpress";
import { siteUrl } from "@/i18n/metadata";

function absoluteUrl(pathname: string) {
  return `${siteUrl}${pathname}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(),
      alternates: {
        languages: {
          vi: absoluteUrl("/"),
          "x-default": absoluteUrl("/"),
        },
      },
    },
  ];

  const posts = await getCmsPublishedPosts("vi");

  entries.push({
    url: absoluteUrl("/blog"),
    lastModified: new Date(),
    alternates: {
      languages: {
        vi: absoluteUrl("/blog"),
        "x-default": absoluteUrl("/blog"),
      },
    },
  });

  posts.forEach((post) => {
    entries.push({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: post.date ? new Date(post.date) : new Date(),
      alternates: {
        languages: {
          vi: absoluteUrl(`/blog/${post.slug}`),
          "x-default": absoluteUrl(`/blog/${post.slug}`),
        },
      },
    });
  });

  return entries;
}

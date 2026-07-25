import type { MetadataRoute } from "next";
import { getCmsPublishedPosts } from "@/lib/cms/payload";
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
          en: absoluteUrl("/en"),
          "x-default": absoluteUrl("/"),
        },
      },
    },
    {
      url: absoluteUrl("/en"),
      lastModified: new Date(),
      alternates: {
        languages: {
          vi: absoluteUrl("/"),
          en: absoluteUrl("/en"),
          "x-default": absoluteUrl("/"),
        },
      },
    },
    {
      url: absoluteUrl("/blog"),
      lastModified: new Date(),
      alternates: {
        languages: {
          vi: absoluteUrl("/blog"),
          en: absoluteUrl("/en/blog"),
          "x-default": absoluteUrl("/blog"),
        },
      },
    },
    {
      url: absoluteUrl("/en/blog"),
      lastModified: new Date(),
      alternates: {
        languages: {
          vi: absoluteUrl("/blog"),
          en: absoluteUrl("/en/blog"),
          "x-default": absoluteUrl("/blog"),
        },
      },
    },
  ];

  const posts = await getCmsPublishedPosts("vi");

  posts.forEach((post) => {
    const viUrl = absoluteUrl(`/blog/${post.slug}`);
    const enUrl = absoluteUrl(`/en/blog/${post.slug}`);
    const lastModified = post.date ? new Date(post.date) : new Date();

    entries.push({
      url: viUrl,
      lastModified,
      alternates: {
        languages: {
          vi: viUrl,
          en: enUrl,
          "x-default": viUrl,
        },
      },
    });

    entries.push({
      url: enUrl,
      lastModified,
      alternates: {
        languages: {
          vi: viUrl,
          en: enUrl,
          "x-default": viUrl,
        },
      },
    });
  });

  return entries;
}

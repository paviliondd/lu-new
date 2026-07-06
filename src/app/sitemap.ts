import type { MetadataRoute } from "next";
import { getCmsPublishedPosts } from "@/lib/cms/wordpress";
import { localePath, locales } from "@/i18n/config";
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
  ];

  const postsByLocale = await Promise.all(
    locales.map(async (locale) => ({
      locale,
      posts: await getCmsPublishedPosts(locale),
    }))
  );

  postsByLocale.forEach(({ locale, posts }) => {
    entries.push({
      url: absoluteUrl(localePath(locale, "/blog")),
      lastModified: new Date(),
      alternates: {
        languages: {
          vi: absoluteUrl("/blog"),
          en: absoluteUrl("/en/blog"),
          "x-default": absoluteUrl("/blog"),
        },
      },
    });

    posts.forEach((post) => {
      const pathname = localePath(locale, `/blog/${post.slug}`);
      entries.push({
        url: absoluteUrl(pathname),
        lastModified: post.date ? new Date(post.date) : new Date(),
        alternates: {
          languages: {
            vi: absoluteUrl(`/blog/${post.slug}`),
            en: absoluteUrl(`/en/blog/${post.slug}`),
            "x-default": absoluteUrl(`/blog/${post.slug}`),
          },
        },
      });
    });
  });

  return entries;
}

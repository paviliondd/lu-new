import type { MetadataRoute } from "next";
import { getCmsPublishedPosts } from "@/lib/cms/wordpress";
import { locales } from "@/i18n/config";
import { siteUrl } from "@/i18n/metadata";

function absoluteUrl(pathname: string) {
  return `${siteUrl}${pathname}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/vi"),
      lastModified: new Date(),
      alternates: {
        languages: {
          vi: absoluteUrl("/vi"),
          en: absoluteUrl("/en"),
          "x-default": absoluteUrl("/vi"),
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
      url: absoluteUrl(`/${locale}/blog`),
      lastModified: new Date(),
      alternates: {
        languages: {
          vi: absoluteUrl("/vi/blog"),
          en: absoluteUrl("/en/blog"),
          "x-default": absoluteUrl("/vi/blog"),
        },
      },
    });

    posts.forEach((post) => {
      const pathname = `/${locale}/blog/${post.slug}`;
      entries.push({
        url: absoluteUrl(pathname),
        lastModified: post.date ? new Date(post.date) : new Date(),
        alternates: {
          languages: {
            vi: absoluteUrl(`/vi/blog/${post.slug}`),
            en: absoluteUrl(`/en/blog/${post.slug}`),
            "x-default": absoluteUrl(`/vi/blog/${post.slug}`),
          },
        },
      });
    });
  });

  return entries;
}

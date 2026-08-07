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

  const postsVi = await getCmsPublishedPosts("vi");
  const postsEn = await getCmsPublishedPosts("en");

  postsVi.forEach((postVi, index) => {
    const postEn = postsEn[index] || postVi;
    const viUrl = absoluteUrl(`/blog/${postVi.slug}`);
    const enUrl = absoluteUrl(`/en/blog/${postEn.slug}`);
    const lastModified = postVi.date ? new Date(postVi.date) : new Date();

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

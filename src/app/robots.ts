import type { MetadataRoute } from "next";
import { siteUrl } from "@/i18n/metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/wp-admin/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

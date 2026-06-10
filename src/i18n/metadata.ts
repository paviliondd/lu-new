import type { Metadata } from "next";
import type { Locale } from "./config";
import { localePath } from "./config";

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://tesst.linuxunity.com"
).replace(/\/$/, "");

export function localizedAlternates(locale: Locale, pathname = "/"): Metadata["alternates"] {
  return {
    canonical: localePath(locale, pathname),
    languages: {
      vi: localePath("vi", pathname),
      en: localePath("en", pathname),
      "x-default": localePath("vi", pathname),
    },
  };
}

export function localizedMetadata(
  locale: Locale,
  pathname: string,
  title: string,
  description: string
): Metadata {
  return {
    title,
    description,
    alternates: localizedAlternates(locale, pathname),
    openGraph: {
      title,
      description,
      siteName: "LinuxUnity",
      locale: locale === "vi" ? "vi_VN" : "en_US",
      alternateLocale: locale === "vi" ? ["en_US"] : ["vi_VN"],
      url: localePath(locale, pathname),
      type: "website",
    },
  };
}

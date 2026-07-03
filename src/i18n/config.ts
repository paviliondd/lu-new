export const locales = ["vi", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "vi";

export function hasLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function localePath(locale: Locale, pathname = "/") {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const pathWithoutLocale = normalizedPath.replace(/^\/(vi|en)(?=\/|$)/, "");
  return `/${locale}${pathWithoutLocale || ""}` || `/${locale}`;
}

export function switchLocalePath(pathname: string, locale: Locale) {
  return localePath(locale, pathname);
}

export function localizePost<T extends {
  title: string;
  title_en: string;
  description: string;
  description_en: string;
  content: string;
  content_en: string;
  readTime: string;
  readTime_en: string;
}>(post: T, locale: Locale): T {
  if (locale === "vi") return post;

  return {
    ...post,
    title: post.title_en.trim() || post.title,
    description: post.description_en.trim() || post.description,
    content: post.content_en.trim() || post.content,
    readTime: post.readTime_en.trim() || post.readTime || "5 min read",
  };
}

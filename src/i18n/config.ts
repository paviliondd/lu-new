export const locales = ["vi", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "vi";

export function hasLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function localePath(locale: Locale, pathname = "/") {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const pathWithoutLocale = normalizedPath.replace(/^\/(vi|en)(?=\/|$)/, "");
  const cleanPath = pathWithoutLocale || "/";

  if (locale === defaultLocale) {
    return cleanPath;
  }

  return cleanPath === "/" ? `/${locale}` : `/${locale}${cleanPath}`;
}

export function switchLocalePath(pathname: string, locale: Locale) {
  return localePath(locale, pathname);
}

export function slugifyText(value: string) {
  return value
    .toLowerCase()
    .replace(/\u0111/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function localizePost<T extends {
  slug: string;
  slug_en?: string;
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

  const enTitle = post.title_en?.trim();
  const viTitle = post.title?.trim();
  const enSlug = post.slug_en?.trim() || (enTitle && enTitle !== viTitle ? slugifyText(enTitle) : post.slug);

  return {
    ...post,
    slug: enSlug || post.slug,
    slug_en: enSlug || post.slug,
    title: enTitle || post.title,
    description: post.description_en.trim() || post.description,
    content: post.content_en.trim() || post.content,
    readTime: post.readTime_en.trim() || post.readTime || "5 min read",
  };
}

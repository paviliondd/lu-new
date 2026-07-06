import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import { posts as fallbackPosts, type Post } from "@/app/data";
import { localizePost, type Locale } from "@/i18n/config";
import { translateLegacyPostToEnglish } from "@/lib/content/legacy-translation";
import { sanitizeArticleHtml } from "@/lib/utils/security";

const postsDirectory = path.join(process.cwd(), "content", "posts");

function basePost(slug: string) {
  return fallbackPosts.find((post) => post.slug === slug);
}

function textList(value: unknown) {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

export async function getLocalizedFilePost(
  slug: string,
  locale: Locale
): Promise<Post | null> {
  const requestedFilePath = path.join(postsDirectory, `${slug}.${locale}.mdx`);
  const fallbackViFilePath = path.join(postsDirectory, `${slug}.vi.mdx`);

  try {
    let filePath = requestedFilePath;
    let sourceLocale = locale;
    let source: string;

    try {
      source = await fs.readFile(filePath, "utf8");
    } catch (error) {
      if (locale !== "en" || (error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }

      filePath = fallbackViFilePath;
      sourceLocale = "vi";
      source = await fs.readFile(filePath, "utf8");
    }

    const { data, content } = matter(source);
    const html = sanitizeArticleHtml(await marked.parse(content, { gfm: true }));
    const fallback = basePost(slug);
    const title = String(data.title || fallback?.title || slug);
    const description = String(data.description || fallback?.description || "");
    const date = String(data.date || fallback?.date || "");
    const readTime = String(data.readTime || fallback?.readTime || "5 min read");

    const post: Post = {
      ...(fallback || {
        id: Math.abs(
          Array.from(slug).reduce((hash, character) => (hash * 31 + character.charCodeAt(0)) | 0, 7)
        ),
        roadmapId: 0,
        roadmapOrder: 0,
        slug,
        category: String(data.category || "LinuxUnity"),
        tags: textList(data.tags),
        author: String(data.author || "nhatnghia"),
        status: "published",
        publishDate: date || null,
        publish_date: date || null,
        date,
        views: 0,
        seriesSlug: data.series ? String(data.series) : null,
        topicSlug: "",
        clusterSlug: "",
        gradient: "from-cyan-600/90 to-blue-700/90",
        certs: [],
        services: [],
        examDomains: [],
        coverage: "",
        labs: [],
        costNote: "",
        cleanupNote: "",
        editorialNote: "",
        quiz: "",
        seo: {
          title,
          description,
          ogImage: data.ogImage ? String(data.ogImage) : null,
        },
        internalLinking: {
          hubSlug: "",
          relatedServiceSlugs: [],
          examDomainSlugs: [],
        },
      }),
      slug,
      title,
      title_en: title,
      description,
      description_en: description,
      content: html,
      content_en: html,
      date,
      publishDate: date || null,
      publish_date: date || null,
      readTime,
      readTime_en: readTime,
      category: String(data.category || fallback?.category || "LinuxUnity"),
      tags: textList(data.tags).length ? textList(data.tags) : fallback?.tags || [],
      author: String(data.author || fallback?.author || "nhatnghia"),
      status: data.draft === true ? "draft" : "published",
      seriesSlug: data.series ? String(data.series) : fallback?.seriesSlug || null,
      seo: {
        title: String(data.seoTitle || data.title || fallback?.seo.title || title),
        description: String(
          data.seoDescription || data.description || fallback?.seo.description || description
        ),
        ogImage: data.ogImage ? String(data.ogImage) : fallback?.seo.ogImage || null,
      },
    };

    const localized = localizePost(post, locale);
    if (locale === "en" && sourceLocale === "vi") {
      return translateLegacyPostToEnglish(localized, "full");
    }

    return localized;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

export async function getLocalizedFilePosts(locale: Locale): Promise<Post[]> {
  try {
    const files = await fs.readdir(postsDirectory);
    const suffix = `.${locale}.mdx`;
    const viSuffix = ".vi.mdx";
    const localizedSlugs = new Set(
      files.filter((file) => file.endsWith(suffix)).map((file) => file.slice(0, -suffix.length))
    );
    const sourceFiles =
      locale === "en"
        ? [
            ...files.filter((file) => file.endsWith(suffix)),
            ...files.filter((file) => {
              if (!file.endsWith(viSuffix)) return false;
              return !localizedSlugs.has(file.slice(0, -viSuffix.length));
            }),
          ]
        : files.filter((file) => file.endsWith(suffix));
    const posts = await Promise.all(
      sourceFiles.map((file) => {
        const activeSuffix = file.endsWith(suffix) ? suffix : viSuffix;
        return getLocalizedFilePost(file.slice(0, -activeSuffix.length), locale);
      })
    );
    return posts.filter((post): post is Post => Boolean(post && post.status === "published"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

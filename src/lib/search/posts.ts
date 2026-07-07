import type { Locale } from "@/i18n/config";
import type { Post } from "@/app/data";
import { getCmsPublishedPosts } from "@/lib/cms/wordpress";

export interface SearchResult {
  post: Post;
  score: number;
  excerpt: string;
  titleHtml: string;
  excerptHtml: string;
  highlights: string[];
}

const tagPattern = /<[^>]*>/g;
const entityPattern = /&(?:nbsp|amp|lt|gt|quot|apos|#\d+);/g;

function stripHtml(value: string) {
  return value
    .replace(tagPattern, " ")
    .replace(entityPattern, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalize(value: string) {
  return stripHtml(value)
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function tokens(value: string) {
  return normalize(value).split(/[^a-z0-9]+/).filter((token) => token.length >= 2);
}

function fieldScore(field: string, query: string, queryTokens: string[], weight: number) {
  const normalized = normalize(field);
  if (!normalized) return 0;

  let score = normalized.includes(query) ? weight * 4 : 0;
  for (const token of queryTokens) {
    if (normalized.includes(token)) {
      score += weight;
    }
  }

  return score;
}

function makeExcerpt(post: Post, queryTokens: string[]) {
  const source = stripHtml(`${post.description} ${post.content}`);
  const normalizedSource = normalize(source);
  const firstMatch = queryTokens
    .map((token) => normalizedSource.indexOf(token))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0];
  const start = Math.max(0, (firstMatch ?? 0) - 90);
  const excerpt = source.slice(start, start + 230).trim();
  return `${start > 0 ? "... " : ""}${excerpt}${start + 230 < source.length ? " ..." : ""}`;
}

export function highlightText(value: string, query: string) {
  const queryTokens = tokens(query);
  if (queryTokens.length === 0) return value;

  const parts = value.split(/(\s+)/);
  return parts
    .map((part) => {
      const normalized = normalize(part);
      const escaped = escapeHtml(part);
      return queryTokens.some((token) => normalized.includes(token))
        ? `<mark>${escaped}</mark>`
        : escaped;
    })
    .join("");
}

export async function searchPosts(locale: Locale, query: string, limit = 12): Promise<SearchResult[]> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];

  const normalizedQuery = normalize(trimmedQuery);
  const queryTokens = tokens(trimmedQuery);
  if (queryTokens.length === 0) return [];

  const posts = await getCmsPublishedPosts(locale);
  return posts
    .map((post) => {
      const searchableTags = [
        post.category,
        ...post.tags,
        post.topicSlug,
        post.clusterSlug,
        ...post.services,
        ...post.examDomains,
        ...post.certs,
      ].join(" ");
      const score =
        fieldScore(post.title, normalizedQuery, queryTokens, 10) +
        fieldScore(searchableTags, normalizedQuery, queryTokens, 7) +
        fieldScore(post.description, normalizedQuery, queryTokens, 5) +
        fieldScore(post.content, normalizedQuery, queryTokens, 1);

      return {
        post,
        score,
        excerpt: makeExcerpt(post, queryTokens),
        titleHtml: highlightText(post.title, trimmedQuery),
        excerptHtml: highlightText(makeExcerpt(post, queryTokens), trimmedQuery),
        highlights: queryTokens,
      };
    })
    .filter((result) => result.score > 0)
    .sort((left, right) => right.score - left.score || +new Date(right.post.date) - +new Date(left.post.date))
    .slice(0, limit);
}

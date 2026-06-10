import { notFound } from "next/navigation";
import { Metadata } from "next";
import { posts as localPublishedPosts, team } from "../../data";
import ArticleClient from "../../components/ArticleClient";
import { getCmsPostBySlug } from "@/lib/cms/wordpress";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

function stripHtml(html = "") {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function slugifyHeading(text: string, index: number) {
  return (
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-") || `heading-${index}`
  );
}

function extractHeadings(content: string) {
  const headings: Array<{ id: string; text: string; level: 2 | 3 }> = [];
  const headingRegex = /<h([23])[^>]*>(.*?)<\/h\1>/gi;
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(content)) !== null) {
    const text = stripHtml(match[2]);
    if (!text) continue;

    headings.push({
      id: slugifyHeading(text, headings.length),
      text,
      level: Number(match[1]) as 2 | 3,
    });
  }

  return headings;
}

// Generate metadata dynamically for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getCmsPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.title} — Cloud DevOps`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      authors: [team[post.author]?.name || ""],
      tags: post.tags,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getCmsPostBySlug(slug);
  
  if (!post) {
    notFound();
  }

  const author = team[post.author] || team.nhatnghia;
  const headings = extractHeadings(post.content);
  const relatedPosts = localPublishedPosts
    .filter((item) => item.slug !== post.slug && item.category === post.category)
    .slice(0, 3);

  return (
    <ArticleClient
      post={post}
      author={author}
      headings={headings}
      relatedPosts={relatedPosts}
    />
  );
}

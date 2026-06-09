import { notFound } from "next/navigation";
import { Metadata } from "next";
import { team } from "../../data";
import ArticleClient from "../../components/ArticleClient";
import { getCmsPostBySlug } from "@/lib/cms/wordpress";

interface Props {
  params: Promise<{ slug: string }>;
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

  return <ArticleClient post={post} author={author} />;
}

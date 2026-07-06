import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Search } from "lucide-react";
import { hasLocale, localePath } from "@/i18n/config";
import { localizedMetadata } from "@/i18n/metadata";
import { highlightText, searchPosts } from "@/lib/search/posts";

interface SearchPageProps {
  params: Promise<{ lang: string }>;
  searchParams?: Promise<{ q?: string }>;
}

export async function generateMetadata({ params }: SearchPageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};

  return localizedMetadata(
    lang,
    "/search",
    lang === "vi" ? "Tìm kiếm - LinuxUnity" : "Search - LinuxUnity",
    lang === "vi"
      ? "Tìm kiếm bài viết LinuxUnity theo tiêu đề, nội dung, tags và danh mục."
      : "Search LinuxUnity posts by title, content, tags, and category."
  );
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const query = (await searchParams)?.q?.trim() || "";
  const results = query ? await searchPosts(lang, query, 24) : [];

  return (
    <div className="theme-page flex-1 py-10">
      <div className="mx-auto w-full max-w-5xl px-4">
        <form action={localePath(lang, "/search")} className="mb-8">
          <label className="mb-3 block text-sm font-bold text-slate-700 dark:text-slate-200">
            {lang === "vi" ? "Tìm kiếm toàn website" : "Search the whole site"}
          </label>
          <div className="theme-card flex items-center gap-3 rounded-xl border px-4 py-3">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              name="q"
              defaultValue={query}
              placeholder={lang === "vi" ? "Nhập tiêu đề, nội dung, tag..." : "Search title, content, tags..."}
              className="min-w-0 flex-1 bg-transparent text-base outline-none"
            />
            <button className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-extrabold text-slate-950" type="submit">
              {lang === "vi" ? "Tìm" : "Search"}
            </button>
          </div>
        </form>

        {!query ? (
          <p className="theme-muted text-sm">
            {lang === "vi" ? "Nhập từ khóa để bắt đầu tìm kiếm." : "Enter a keyword to start searching."}
          </p>
        ) : results.length === 0 ? (
          <div className="theme-card rounded-xl border p-8 text-center">
            <p className="font-bold">{lang === "vi" ? "Không tìm thấy kết quả" : "No results found"}</p>
            <p className="theme-muted mt-2 text-sm">&quot;{query}&quot;</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="theme-muted text-sm">
              {lang === "vi" ? `${results.length} kết quả phù hợp` : `${results.length} matching results`}
            </p>
            {results.map(({ post, excerpt }) => (
              <Link
                key={post.slug}
                href={localePath(lang, `/blog/${post.slug}`)}
                className="theme-card block rounded-xl border p-5 transition hover:border-emerald-400/70"
              >
                <div className="mb-2 flex flex-wrap gap-2">
                  {[post.category, ...post.tags.slice(0, 3)].filter(Boolean).map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-200 px-2 py-1 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {tag}
                    </span>
                  ))}
                </div>
                <h2
                  className="text-lg font-extrabold text-slate-950 dark:text-white"
                  dangerouslySetInnerHTML={{ __html: highlightText(post.title, query) }}
                />
                <p
                  className="theme-muted mt-2 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: highlightText(excerpt || post.description, query) }}
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

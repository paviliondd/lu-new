"use client";

import Link from "next/link";
import { ArrowRight, Boxes, GitPullRequest, Layers, Sparkles, Zap } from "lucide-react";
import type { Post, Series } from "@/app/data";
import { team } from "@/app/data";
import PostCard from "@/app/components/PostCard";
import { useLanguage } from "@/app/components/LanguageProvider";
import { usePublishedPosts } from "@/app/components/usePublishedPosts";

interface HomePageProps {
  initialPosts: Post[];
  seriesItems: Series[];
}

export default function HomePage({ initialPosts, seriesItems }: HomePageProps) {
  const { t, language, localePath } = useLanguage();
  const posts = usePublishedPosts(initialPosts);
  const recentPosts = [...posts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7);
  const featuredPost = recentPosts[0];
  const supportingPosts = recentPosts.slice(1, 4);
  const morePosts = recentPosts.slice(4, 7);

  const renderSeriesIcon = (iconName: string) => {
    switch (iconName) {
      case "zap":
        return <Zap className="h-5 w-5" />;
      case "git-pull-request":
        return <GitPullRequest className="h-5 w-5" />;
      default:
        return <Layers className="h-5 w-5" />;
    }
  };

  return (
    <div className="theme-page min-h-screen overflow-x-clip">
      <section className="theme-surface relative isolate overflow-hidden border-b theme-border">
        <div className="theme-hero absolute inset-0 -z-10" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.05fr_.95fr] lg:py-20">
          <div className="min-w-0">
            <span className="inline-flex max-w-full items-center gap-2 rounded-full border theme-border bg-white/70 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-teal-700 shadow-sm dark:bg-slate-900/70 dark:text-emerald-300 sm:px-4 sm:text-xs sm:tracking-[0.18em]">
              <Sparkles className="h-3.5 w-3.5" />
              {t("exploreBuildShare")}
            </span>
            <h1 className="mt-7 max-w-4xl break-words text-4xl font-extrabold leading-[1.05] tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">
              {t("heroTitlePart1")}
              <span className="block text-teal-700 dark:text-emerald-300">
                {t("heroTitlePart2")}
              </span>
            </h1>
            <p className="theme-muted mt-6 max-w-2xl text-base leading-8 sm:text-lg">
              {t("heroDesc")}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href={localePath("/blog")}
                className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-slate-950 px-6 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 sm:w-auto"
              >
                {t("readBlog")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href={localePath("/blog/series")}
                className="inline-flex h-11 w-full items-center justify-center rounded-lg border theme-border bg-white/70 px-6 text-sm font-semibold text-slate-800 transition hover:border-teal-500 hover:bg-white dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-emerald-400 sm:w-auto"
              >
                {t("series")}
              </Link>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="theme-card relative grid gap-4 rounded-xl border p-5 backdrop-blur-xl">
              <div className="theme-panel flex items-center gap-3 rounded-lg border theme-border p-4">
                <Boxes className="h-5 w-5 text-teal-700 dark:text-emerald-300" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Cloud native</p>
                  <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">Architecture, automation, security</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {["AWS", "Kubernetes", "Terraform", "CI/CD"].map((item, index) => (
                  <div
                    key={item}
                    className={`rounded-lg border theme-border p-5 ${
                      index % 2 === 0 ? "bg-white/55 dark:bg-slate-900/40" : "theme-panel"
                    }`}
                  >
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-9 flex min-w-0 items-end justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700 dark:text-emerald-300">
                {t("recentWriting")}
              </p>
              <h2 className="mt-3 break-words text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                {t("allPosts")}
              </h2>
            </div>
            <Link
              href={localePath("/blog")}
              className="hidden items-center gap-2 rounded-lg border theme-border bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-teal-500 hover:text-slate-950 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-emerald-400 sm:flex"
            >
              {t("viewAll")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {featuredPost ? (
            <>
              <div className="grid gap-6 lg:grid-cols-[1.45fr_.75fr]">
                <PostCard
                  post={featuredPost}
                  author={team[featuredPost.author]}
                  locale={language}
                  featured
                />
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
                  {supportingPosts.slice(0, 2).map((post) => (
                    <PostCard
                      key={post.slug}
                      post={post}
                      author={team[post.author]}
                      locale={language}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-3">
                {[...supportingPosts.slice(2), ...morePosts].slice(0, 3).map((post) => (
                  <PostCard
                    key={post.slug}
                    post={post}
                    author={team[post.author]}
                    locale={language}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="theme-card rounded-xl border border-dashed p-12 text-center text-sm theme-muted">
              {t("noPosts")}
            </div>
          )}
        </div>
      </section>

      <section className="theme-surface border-t theme-border py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700 dark:text-emerald-300">
              {t("collections")}
            </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
              {t("series")}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {seriesItems.map((item) => (
              <Link
                key={item.slug}
                href={localePath(`/blog/series/${item.slug}`)}
                className="theme-card group flex min-h-56 flex-col rounded-xl border p-6 transition duration-200 hover:-translate-y-0.5 hover:border-teal-500 dark:hover:border-emerald-400"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border theme-border bg-white text-teal-700 dark:bg-slate-900 dark:text-emerald-300">
                  {renderSeriesIcon(item.icon)}
                </div>
                <h3 className="mt-6 line-clamp-2 text-lg font-bold text-slate-950 transition group-hover:text-teal-700 dark:text-white dark:group-hover:text-emerald-300">
                  {language === "vi" ? item.title : item.title_en}
                </h3>
                <p className="theme-muted mt-3 line-clamp-2 text-sm leading-6">
                  {language === "vi" ? item.description : item.description_en}
                </p>
                <span className="mt-auto flex items-center gap-2 pt-6 text-sm font-bold text-teal-700 dark:text-emerald-300">
                  {item.partsCount} {t("parts")}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

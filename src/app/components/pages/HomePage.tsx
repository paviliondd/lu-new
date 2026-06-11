"use client";

import Link from "next/link";
import { ArrowRight, Boxes, GitPullRequest, Layers, Sparkles, Zap } from "lucide-react";
import type { Post } from "@/app/data";
import { series, team } from "@/app/data";
import PostCard from "@/app/components/PostCard";
import { useLanguage } from "@/app/components/LanguageProvider";
import { usePublishedPosts } from "@/app/components/usePublishedPosts";

interface HomePageProps {
  initialPosts: Post[];
}

export default function HomePage({ initialPosts }: HomePageProps) {
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
    <div className="min-h-screen bg-[#0F172A] text-slate-100">
      <section className="relative isolate overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(52,211,153,0.16),transparent_28%),radial-gradient(circle_at_85%_15%,rgba(34,211,238,0.15),transparent_28%),linear-gradient(180deg,#0B132B_0%,#0F172A_100%)]" />
        <div className="mx-auto grid min-h-[68vh] max-w-7xl items-center gap-12 px-4 py-20 lg:grid-cols-[1.05fr_.95fr] lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              {t("exploreBuildShare")}
            </span>
            <h1 className="mt-7 max-w-4xl text-5xl font-extrabold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl">
              {t("heroTitlePart1")}
              <span className="block bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                {t("heroTitlePart2")}
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              {t("heroDesc")}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href={localePath("/blog")}
                className="inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-7 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-950/40 transition hover:-translate-y-0.5 hover:brightness-110"
              >
                {t("readBlog")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href={localePath("/blog/series")}
                className="inline-flex h-12 items-center justify-center rounded-full border border-slate-600 bg-slate-900/50 px-7 text-sm font-semibold text-slate-100 transition hover:border-cyan-400 hover:text-cyan-300"
              >
                {t("series")}
              </Link>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute -inset-8 rounded-full bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 blur-3xl" />
            <div className="relative grid gap-4 rounded-[2rem] border border-slate-700/70 bg-slate-900/65 p-5 shadow-2xl shadow-slate-950/50 backdrop-blur-xl">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-[#0B132B]/80 p-4">
                <Boxes className="h-5 w-5 text-emerald-300" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Cloud native</p>
                  <p className="mt-1 font-semibold text-slate-100">Architecture, automation, security</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {["AWS", "Kubernetes", "Terraform", "CI/CD"].map((item, index) => (
                  <div
                    key={item}
                    className={`rounded-2xl border border-slate-700 p-5 ${
                      index % 2 === 0 ? "bg-emerald-400/10" : "bg-cyan-400/10"
                    }`}
                  >
                    <span className="text-sm font-bold text-slate-100">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-9 flex items-end justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
                {t("recentWriting")}
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {t("allPosts")}
              </h2>
            </div>
            <Link
              href={localePath("/blog")}
              className="hidden items-center gap-2 text-sm font-bold text-cyan-300 transition hover:text-emerald-300 sm:flex"
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
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-12 text-center text-sm text-slate-400">
              {t("noPosts")}
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-slate-800 bg-[#0B132B] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
              {t("collections")}
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">
              {t("series")}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {series.map((item) => (
              <Link
                key={item.slug}
                href={localePath(`/blog/series/${item.slug}`)}
                className="group flex min-h-60 flex-col rounded-2xl border border-slate-700 bg-slate-900/70 p-6 transition duration-300 hover:-translate-y-1 hover:border-emerald-400/60 hover:shadow-xl hover:shadow-emerald-950/30"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 text-cyan-300">
                  {renderSeriesIcon(item.icon)}
                </div>
                <h3 className="mt-6 line-clamp-2 text-lg font-bold text-white transition group-hover:text-emerald-300">
                  {language === "vi" ? item.title : item.title_en}
                </h3>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-400">
                  {language === "vi" ? item.description : item.description_en}
                </p>
                <span className="mt-auto flex items-center gap-2 pt-6 text-sm font-bold text-cyan-300">
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

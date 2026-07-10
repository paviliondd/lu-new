"use client";

import Link from "next/link";
import { useLanguage } from "@/app/components/LanguageProvider";

export default function BlogPostNotFound() {
  const { language, localePath } = useLanguage();

  return (
    <main className="theme-page min-h-[70vh] px-4 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700 dark:text-emerald-300">
          404
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
          {language === "vi" ? "Bài viết chưa khả dụng" : "Article unavailable"}
        </h1>
        <p className="mt-4 text-sm leading-6 theme-muted">
          {language === "vi"
            ? "Bài viết có thể đang là bản nháp, chưa có nội dung hoặc chưa được xuất bản."
            : "This article may still be a draft, have no content, or not be published yet."}
        </p>
        <Link
          href={localePath("/blog")}
          replace
          className="mt-8 inline-flex h-11 items-center justify-center rounded-lg bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
        >
          {language === "vi" ? "Quay lại blog" : "Back to blog"}
        </Link>
      </div>
    </main>
  );
}

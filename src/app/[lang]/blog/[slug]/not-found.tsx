"use client";

import Link from "next/link";
import { useLanguage } from "@/app/components/LanguageProvider";

export default function BlogPostNotFound() {
  const { language, localePath } = useLanguage();

  return (
    <main className="min-h-[70vh] bg-white px-4 py-20 text-gray-900 dark:bg-gray-950 dark:text-white">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
          404
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
          {language === "vi" ? "Bài viết chưa khả dụng" : "Article unavailable"}
        </h1>
        <p className="mt-4 text-sm leading-6 text-gray-500 dark:text-gray-400">
          {language === "vi"
            ? "Bài viết có thể đang là bản nháp, chưa có nội dung hoặc chưa được xuất bản."
            : "This article may still be a draft, have no content, or not be published yet."}
        </p>
        <Link
          href={localePath("/blog")}
          replace
          className="mt-8 inline-flex h-10 items-center justify-center rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          {language === "vi" ? "Quay lại blog" : "Back to blog"}
        </Link>
      </div>
    </main>
  );
}

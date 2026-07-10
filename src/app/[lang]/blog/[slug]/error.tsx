"use client";

import { useEffect } from "react";

export default function ArticleError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("Article render failed", error);
  }, [error]);

  return (
    <section className="theme-page flex min-h-[50vh] items-center justify-center px-4 py-16">
      <div className="theme-card max-w-xl rounded-xl border p-8 text-center shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-300">
          Article unavailable
        </p>
        <h2 className="mt-3 text-2xl font-bold text-slate-950 dark:text-white">
          Could not load this article.
        </h2>
        <p className="mt-3 text-sm leading-6 theme-muted">
          The content may be updating or the CMS response failed while rendering this page.
        </p>
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="mt-6 min-h-11 rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
        >
          Try again
        </button>
      </div>
    </section>
  );
}

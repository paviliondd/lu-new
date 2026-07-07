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
    <section className="flex min-h-[50vh] items-center justify-center bg-[#0F172A] px-4 py-16 text-slate-100">
      <div className="max-w-xl rounded-2xl border border-red-400/20 bg-slate-900/80 p-8 text-center shadow-xl shadow-slate-950/20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-300">
          Article unavailable
        </p>
        <h2 className="mt-3 text-2xl font-bold text-white">
          Could not load this article.
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          The content may be updating or the CMS response failed while rendering this page.
        </p>
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="mt-6 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
        >
          Try again
        </button>
      </div>
    </section>
  );
}

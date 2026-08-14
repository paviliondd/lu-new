"use client";

import { useEffect, useState } from "react";
import { Eye, Link2 } from "lucide-react";

interface ArticleViewCountProps {
  hidden?: boolean;
  initialViews: number;
  language: string;
  slug: string;
  viewsLabel: string;
}

function formatViews(value: number, language: string) {
  return value.toLocaleString(language === "vi" ? "vi-VN" : "en-US");
}

export function ArticleViewCount({ hidden = false, initialViews, language, slug, viewsLabel }: ArticleViewCountProps) {
  const [views, setViews] = useState(initialViews);

  useEffect(() => {
    const storageKey = `linuxunity:viewed:${slug}`;
    const viewedAt = Number(localStorage.getItem(storageKey) || 0);
    const viewWindowMs = 30 * 60 * 1000;

    if (viewedAt && Date.now() - viewedAt < viewWindowMs) return;
    localStorage.setItem(storageKey, String(Date.now()));

    fetch(`/api/posts/${encodeURIComponent(slug)}/view`, { method: "POST" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { views?: number } | null) => {
        if (typeof payload?.views === "number") setViews(payload.views);
      })
      .catch(() => localStorage.removeItem(storageKey));
  }, [slug]);

  return (
    <span className={hidden ? "hidden" : "flex items-center gap-1.5"}>
      <Eye className="h-3.5 w-3.5" />
      {formatViews(views, language)} {viewsLabel}
    </span>
  );
}

interface ArticleShareControlsProps {
  copiedLabel: string;
  copyLabel: string;
  shareLabel: string;
  twitterLabel: string;
}

export function ArticleShareControls({ copiedLabel, copyLabel, shareLabel, twitterLabel }: ArticleShareControlsProps) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const shareToTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <div className="space-y-3 px-1">
      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{shareLabel}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={copyLink}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border theme-border text-gray-500 transition hover:bg-slate-100 hover:text-slate-950 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-white"
          title={copyLabel}
        >
          <Link2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={shareToTwitter}
          className="flex h-10 w-10 items-center justify-center rounded-lg border theme-border text-gray-500 transition hover:bg-slate-100 hover:text-slate-950 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-white"
          title={twitterLabel}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
        </button>
        {copied && <span className="animate-fade-in text-[10px] font-medium text-emerald-600 dark:text-emerald-400">{copiedLabel}</span>}
      </div>
    </div>
  );
}

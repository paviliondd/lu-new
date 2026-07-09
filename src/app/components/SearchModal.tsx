"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, FileText, Search, X } from "lucide-react";
import { useLanguage } from "./LanguageProvider";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  slug: string;
  title: string;
  titleHtml?: string;
  description: string;
  category: string;
  tags: string[];
  excerpt: string;
  excerptHtml?: string;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const { t, localePath, language } = useLanguage();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (query.trim().length < 2) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          q: query,
          locale: language,
          limit: "8",
        });
        const response = await fetch(`/api/search?${params}`, {
          signal: controller.signal,
        });
        const payload = response.ok ? await response.json() : { results: [] };
        setResults(payload.results || []);
        setActiveIndex(0);
      } catch {
        if (!controller.signal.aborted) setResults([]);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [isOpen, language, query]);

  const activeHref = useMemo(() => {
    const result = results[activeIndex];
    return result ? localePath(`/blog/${result.slug}`) : null;
  }, [activeIndex, localePath, results]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((value) => Math.min(results.length - 1, value + 1));
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((value) => Math.max(0, value - 1));
      }
      if (event.key === "Enter" && activeHref) {
        event.preventDefault();
        window.location.href = activeHref;
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeHref, isOpen, onClose, results.length]);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-x-hidden px-3 py-4 sm:px-4 sm:py-20">
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("search")}
        className="theme-card relative flex max-h-[calc(100dvh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border shadow-xl shadow-slate-950/20 sm:max-h-[72dvh]"
      >
        <div className="flex min-w-0 items-center gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <Search className="h-5 w-5 shrink-0 text-slate-400" />
          <input
            ref={inputRef}
            type="search"
            placeholder={t("searchPlaceholder")}
            value={query}
            onChange={(event) => {
              const nextQuery = event.target.value;
              setQuery(nextQuery);
              if (nextQuery.trim().length < 2) {
                setResults([]);
                setIsLoading(false);
                setActiveIndex(0);
              } else {
                setResults([]);
                setIsLoading(true);
                setActiveIndex(0);
              }
            }}
            className="h-11 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-slate-400"
          />
          {isLoading && (
            <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 text-[10px] font-black text-slate-400 dark:border-slate-700">
              …
            </span>
          )}
          {query.trim() && (
            <Link
              href={`${localePath("/search")}?q=${encodeURIComponent(query.trim())}`}
              onClick={onClose}
              className="hidden rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold transition hover:border-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 dark:border-slate-700 sm:inline-flex"
            >
              {language === "vi" ? "Tất cả" : "All"}
            </Link>
          )}
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Close search"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          {query.trim().length < 2 ? (
            <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              {t("searchHint")}
            </div>
          ) : isLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="animate-pulse rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="mb-3 h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-800" />
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No results found: &quot;{query}&quot;
            </div>
          ) : (
            <div className="space-y-2">
              <div className="px-2 pb-1 text-xs font-bold uppercase text-slate-400">
                {t("articles")} ({results.length})
              </div>
              {results.map((post, index) => (
                <Link
                  key={post.slug}
                  href={localePath(`/blog/${post.slug}`)}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={onClose}
                  className={`group flex min-w-0 items-start gap-3 rounded-xl border border-transparent p-3 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 ${
                    index === activeIndex
                      ? "border-emerald-400/20 bg-emerald-400/10"
                      : "hover:border-slate-200 hover:bg-slate-100 dark:hover:border-slate-700 dark:hover:bg-slate-800/70"
                  }`}
                >
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-300">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span
                      className="block text-sm font-extrabold leading-snug text-slate-950 dark:text-white"
                      dangerouslySetInnerHTML={{ __html: post.titleHtml || post.title }}
                    />
                    <div className="mt-1 flex flex-wrap gap-1">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                        {post.category}
                      </span>
                      {post.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400 sm:text-sm">
                      <span
                        dangerouslySetInnerHTML={{
                          __html: post.excerptHtml || post.excerpt || post.description,
                        }}
                      />
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 -translate-x-2 self-center text-slate-400 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-4 py-3 text-[11px] text-slate-400 dark:border-slate-800">
          <span>{t("closeSearch")}</span>
          <span>{language === "vi" ? "↑ ↓ để chọn, Enter để mở" : "Use ↑ ↓ to select, Enter to open"}</span>
        </div>
      </div>
    </div>,
    document.body
  );
}

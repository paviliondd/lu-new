"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useRef } from "react";
import { Search, X, FileText, ArrowRight } from "lucide-react";
import { posts as initialPosts } from "../data";
import { useLanguage } from "./LanguageProvider";
import { usePublishedPosts } from "./usePublishedPosts";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const { t, localePath } = useLanguage();
  const [query, setQuery] = useState("");
  const posts = usePublishedPosts(initialPosts);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const results = useMemo(() => {
    if (!query.trim()) {
      return [];
    }

    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.description.toLowerCase().includes(query.toLowerCase()) ||
        post.category.toLowerCase().includes(query.toLowerCase())
    );
  }, [posts, query]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0B132B]/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-700 bg-[#0B132B]/95 shadow-2xl shadow-slate-950/40 backdrop-blur-xl transition-all"
      >
        {/* Input area */}
        <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300">
            <Search className="h-4 w-4" />
          </div>
          <input
            ref={inputRef}
            type="text"
            placeholder={t("searchPlaceholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-11 w-full bg-transparent text-base text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-100"
          />
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100"
            aria-label="Close search"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results area */}
        <div className="max-h-[62vh] overflow-y-auto p-4">
          {query.trim() === "" ? (
            <div className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
              {t("searchHint")}
            </div>
          ) : results.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
              {t("noSearchResults")}: &quot;{query}&quot;
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-2 mb-2">
                {t("articles")} ({results.length})
              </div>
              {results.map((post) => (
                <Link
                  key={post.slug}
                  href={localePath(`/blog/${post.slug}`)}
                  onClick={onClose}
                className="group flex items-start gap-3 rounded-2xl p-3 transition hover:bg-cyan-50/70 dark:hover:bg-cyan-950/20"
              >
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-400 transition group-hover:bg-cyan-100 group-hover:text-cyan-700 dark:bg-gray-900 dark:group-hover:bg-cyan-950/50 dark:group-hover:text-cyan-300">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block truncate text-sm font-semibold text-gray-900 group-hover:text-cyan-700 dark:text-gray-100 dark:group-hover:text-cyan-300">
                      {post.title}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">
                      {post.description}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 -translate-x-2 self-center text-gray-400 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50/80 px-5 py-3 text-[10px] text-gray-400 dark:border-gray-800 dark:bg-gray-900/60">
          <div>
            {t("closeSearch")}
          </div>
          <div>
            {t("smartSearch")}
          </div>
        </div>
      </div>
    </div>
  );
}

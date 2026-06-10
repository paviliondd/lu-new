"use client";

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
  const { t, language } = useLanguage();
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
        post.title_en.toLowerCase().includes(query.toLowerCase()) ||
        post.description.toLowerCase().includes(query.toLowerCase()) ||
        post.description_en.toLowerCase().includes(query.toLowerCase()) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-950/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl transition-all dark:border-gray-800 dark:bg-gray-900">
        {/* Input area */}
        <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-4 dark:border-gray-800">
          <Search className="h-5 w-5 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder={t("searchPlaceholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-base text-gray-900 bg-transparent placeholder-gray-450 outline-none dark:text-gray-100"
          />
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results area */}
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {query.trim() === "" ? (
            <div className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
              {language === "vi"
                ? "Nhập từ khóa để tìm kiếm các bài viết về AWS, Kubernetes, Terraform, CI/CD..."
                : "Enter keywords to search posts about AWS, Kubernetes, Terraform, CI/CD..."}
            </div>
          ) : results.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
              {language === "vi"
                ? `Không tìm thấy kết quả nào phù hợp với "${query}"`
                : `No results found for "${query}"`}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-2 mb-2">
                {language === "vi" ? `Bài viết (${results.length})` : `Articles (${results.length})`}
              </div>
              {results.map((post) => (
                <a
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  onClick={onClose}
                  className="group flex items-start gap-3 rounded-xl p-3 transition hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <FileText className="h-5 w-5 text-gray-400 mt-0.5 group-hover:text-brand-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 truncate">
                        {language === "vi" ? post.title : post.title_en}
                      </span>
                      <span className="text-[10px] bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded-full font-medium shrink-0">
                        {post.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">
                      {language === "vi" ? post.description : post.description_en}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 opacity-0 -translate-x-2 transition group-hover:opacity-100 group-hover:translate-x-0 shrink-0 self-center" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-2.5 text-[10px] text-gray-400 dark:border-gray-800 dark:bg-gray-950/50">
          <div>
            {language === "vi" ? (
              <>Nhấn <kbd className="font-sans font-bold">ESC</kbd> để đóng</>
            ) : (
              <>Press <kbd className="font-sans font-bold">ESC</kbd> to close</>
            )}
          </div>
          <div>
            {language === "vi" ? "Tìm kiếm thông minh bởi Cloud DevOps" : "Smart search by Cloud DevOps"}
          </div>
        </div>
      </div>
    </div>
  );
}

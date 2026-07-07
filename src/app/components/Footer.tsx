"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Cloud, Rss, ArrowRight, CheckCircle2 } from "lucide-react";
import { useLanguage } from "./LanguageProvider";

export default function Footer() {
  const { t, localePath } = useLanguage();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="theme-surface border-t theme-border">
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href={localePath("/")} className="flex items-center gap-2 group w-fit">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 text-slate-950 shadow transition group-hover:scale-105">
                <Cloud className="h-4.5 w-4.5" />
              </div>
              <span className="text-base font-bold tracking-tight text-slate-950 dark:text-white">
                Linux<span className="font-extrabold text-emerald-300">Unity</span>
              </span>
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
              {t("logoSubtitle")}
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
                aria-label="GitHub"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition"
                aria-label="LinkedIn"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <Link
                href={localePath("/feed.xml")}
                className="text-gray-400 hover:text-amber-600 dark:hover:text-amber-500 transition"
                aria-label="RSS Feed"
              >
                <Rss className="h-4.5 w-4.5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-gray-100">
              {t("blog")}
            </h3>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <Link href={localePath("/blog")} className="text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 transition">
                  {t("recentWriting")}
                </Link>
              </li>
              <li>
                <Link href={localePath("/blog/series")} className="text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 transition">
                  {t("series")}
                </Link>
              </li>
              <li>
                <Link href={`${localePath("/blog")}?tag=IaC`} className="text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 transition">
                  Infrastructure as Code
                </Link>
              </li>
              <li>
                <Link href={`${localePath("/blog")}?tag=Serverless`} className="text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 transition">
                  Serverless AWS
                </Link>
              </li>
            </ul>
          </div>

          {/* About Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-gray-100">
              {t("about")}
            </h3>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <Link href={localePath("/about")} className="text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 transition">
                  {t("about")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-gray-100">
              {t("newsletterTitle")}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              {t("newsletterDesc")}
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 px-3 py-2 text-xs text-emerald-800 dark:text-emerald-400">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                <span>{t("newsletterSuccess")}</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="relative flex items-center">
                <input
                  type="email"
                  required
                  placeholder={t("newsletterPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white py-2 pl-3 pr-10 text-xs text-gray-900 outline-none focus:border-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-brand-400"
                />
                <button
                  type="submit"
                  aria-label="Submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-brand-600 p-1 text-white transition hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 cursor-pointer"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-12 border-t theme-border pt-8 text-center text-xs theme-muted">
          <p>© {new Date().getFullYear()} LinuxUnity. {t("footerText")}</p>
        </div>
      </div>
    </footer>
  );
}

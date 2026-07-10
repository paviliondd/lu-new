"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Cloud, Rss, ArrowRight, CheckCircle2 } from "lucide-react";
import { useLanguage } from "./LanguageProvider";

export default function Footer() {
  const { t, localePath } = useLanguage();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextEmail = email.trim();
    if (!nextEmail || isSubmitting) return;

    setError("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ email: nextEmail }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || "Unable to subscribe");
      }

      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to subscribe");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="theme-surface border-t theme-border">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_0.7fr_1.2fr]">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href={localePath("/")} className="group flex w-fit items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border theme-border bg-white text-teal-700 transition group-hover:border-teal-500 dark:bg-slate-900 dark:text-emerald-300 dark:group-hover:border-emerald-400">
                <Cloud className="h-4 w-4" />
              </div>
              <span className="text-base font-bold tracking-tight text-slate-950 dark:text-white">
                Linux<span className="font-extrabold text-teal-700 dark:text-emerald-300">Unity</span>
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-6 theme-muted">
              {t("logoSubtitle")}
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-10 w-10 place-items-center rounded-lg border theme-border text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                aria-label="GitHub"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-10 w-10 place-items-center rounded-lg border theme-border text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                aria-label="LinkedIn"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <Link
                href={localePath("/feed.xml")}
                className="grid h-10 w-10 place-items-center rounded-lg border theme-border text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                aria-label="RSS Feed"
              >
                <Rss className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-950 dark:text-white">
              {t("blog")}
            </h3>
            <ul className="mt-4 space-y-1 text-sm">
              <li>
                <Link href={localePath("/blog")} className="inline-flex min-h-9 items-center theme-muted transition hover:text-teal-700 dark:hover:text-emerald-300">
                  {t("recentWriting")}
                </Link>
              </li>
              <li>
                <Link href={localePath("/blog/series")} className="inline-flex min-h-9 items-center theme-muted transition hover:text-teal-700 dark:hover:text-emerald-300">
                  {t("series")}
                </Link>
              </li>
              <li>
                <Link href={`${localePath("/blog")}?tag=IaC`} className="inline-flex min-h-9 items-center theme-muted transition hover:text-teal-700 dark:hover:text-emerald-300">
                  Infrastructure as Code
                </Link>
              </li>
              <li>
                <Link href={`${localePath("/blog")}?tag=Serverless`} className="inline-flex min-h-9 items-center theme-muted transition hover:text-teal-700 dark:hover:text-emerald-300">
                  Serverless AWS
                </Link>
              </li>
            </ul>
          </div>

          {/* About Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-950 dark:text-white">
              {t("about")}
            </h3>
            <ul className="mt-4 space-y-1 text-sm">
              <li>
                <Link href={localePath("/about")} className="inline-flex min-h-9 items-center theme-muted transition hover:text-teal-700 dark:hover:text-emerald-300">
                  {t("about")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-950 dark:text-white">
              {t("newsletterTitle")}
            </h3>
            <p className="text-sm leading-6 theme-muted">
              {t("newsletterDesc")}
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
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
                  aria-invalid={Boolean(error)}
                  className="min-h-11 w-full rounded-lg border theme-border bg-white py-2 pl-3 pr-12 text-sm text-slate-950 outline-none transition focus:border-teal-500 dark:bg-slate-900 dark:text-white dark:focus:border-emerald-400"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  aria-label="Submit"
                  className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 cursor-pointer place-items-center rounded-md bg-slate-950 text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-70 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>
            )}
            {error && (
              <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
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

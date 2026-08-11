"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLanguage } from "./LanguageProvider";
import NewsletterSection from "./NewsletterSection";
import { siteConfig } from "@/config/site";

export default function Footer() {
  const { localePath } = useLanguage();
  const pathname = usePathname();
  const normalizedPathname = pathname.replace(/\/$/, "") || "/";
  const isHome = normalizedPathname === "/" || normalizedPathname === "/vi" || normalizedPathname === "/en";
  const links = [
    { href: "/blog", label: "Blog" },
    { href: "/blog/series", label: "Series" },
    { href: "/about", label: "About" },
  ];

  return (
    <footer className="theme-surface border-t theme-border">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
        <div className={isHome ? "flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between" : "flex flex-col gap-8 lg:grid lg:grid-cols-[2fr_0.5fr_1fr] lg:items-center lg:gap-x-10"}>
          <Link href={localePath("/")} className="group flex w-fit items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border theme-border bg-white p-1 transition group-hover:border-teal-500 group-hover:shadow-sm dark:bg-slate-900 dark:group-hover:border-emerald-400">
              <Image src="/images/linuxunity-penguin-logo.png" alt="LinuxUnity Logo" width={40} height={40} className="object-contain" />
            </div>
            <span className="block text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-[1.65rem]">
              {siteConfig.name.replace("Unity", "")}<span className="text-teal-700 dark:text-emerald-300">Unity</span>
            </span>
          </Link>

          <nav aria-label="Footer navigation" className={isHome ? "sm:text-right" : "lg:w-40 lg:justify-self-center lg:text-left"}>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-950 dark:text-white">Explore</p>
            <div className={`mt-3 flex flex-wrap gap-x-5 gap-y-2 ${isHome ? "sm:justify-end" : "lg:justify-start"}`}>
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={localePath(link.href)}
                  className="inline-flex min-h-11 items-center text-sm font-medium theme-muted transition hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:hover:text-emerald-300"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          {!isHome && <NewsletterSection compact />}
        </div>

        <div className="mt-8 border-t theme-border pt-5 text-center text-xs theme-muted">
          <p>© {new Date().getFullYear()} {siteConfig.name}.</p>
        </div>
      </div>
    </footer>
  );
}

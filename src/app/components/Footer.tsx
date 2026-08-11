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
      {!isHome && <NewsletterSection compact />}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <Link href={localePath("/")} className="group flex w-fit items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border theme-border bg-white p-1 transition group-hover:border-teal-500 group-hover:shadow-sm dark:bg-slate-900 dark:group-hover:border-emerald-400">
              <Image src="/images/linuxunity-penguin-logo.png" alt="LinuxUnity Logo" width={34} height={34} className="object-contain" />
            </div>
            <div>
              <span className="block text-xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                {siteConfig.name.replace("Unity", "")}<span className="text-teal-700 dark:text-emerald-300">Unity</span>
              </span>
              <span className="mt-0.5 block text-xs theme-muted">Cloud infrastructure notes</span>
            </div>
          </Link>

          <nav aria-label="Footer navigation" className="sm:text-right">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-950 dark:text-white">Explore</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 sm:justify-end">
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
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t theme-border pt-5 text-xs theme-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {siteConfig.name}.</p>
          <p className="font-medium tracking-wide">Explore · Learn · Share</p>
        </div>
      </div>
    </footer>
  );
}

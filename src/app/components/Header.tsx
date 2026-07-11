"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X, Cloud } from "lucide-react";
import { useLanguage } from "./LanguageProvider";
import ThemeToggle from "./ThemeToggle";
import SearchModal from "./SearchModal";

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { t, localePath, language, setLanguage } = useLanguage();

  const navLinks = [
    { href: localePath("/blog"), label: t("blog") },
    { href: localePath("/blog/series"), label: t("series") },
    { href: localePath("/about"), label: t("about") },
  ];
  const activeNavHref = navLinks
    .filter((link) => pathname === link.href || pathname.startsWith(`${link.href}/`))
    .sort((left, right) => right.href.length - left.href.length)[0]?.href;
  const isSearchPage = pathname === localePath("/search");

  const openSearch = useCallback(() => {
    if (isSearchPage) {
      document.getElementById("site-search-input")?.focus();
      return;
    }
    setIsSearchOpen(true);
  }, [isSearchPage]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openSearch();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openSearch]);

  return (
    <header className="theme-header sticky top-0 z-40 border-b backdrop-blur-xl">
        <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          {/* Logo */}
          <Link href={localePath("/")} className="group flex min-w-0 items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border theme-border bg-white text-teal-700 shadow-sm transition duration-200 group-hover:border-teal-500 group-hover:text-teal-800 dark:bg-slate-900 dark:text-emerald-300">
              <Cloud className="h-5 w-5" />
            </div>
            <span className="truncate text-lg font-bold tracking-tight text-slate-950 dark:text-white">
              Linux<span className="font-extrabold text-teal-600 dark:text-emerald-300">Unity</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <ul className="hidden items-center overflow-hidden rounded-xl border theme-border bg-white/70 p-1 dark:bg-slate-950/35 md:flex">
            {navLinks.map((link) => {
              const isActive = link.href === activeNavHref;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`block rounded-lg px-3.5 py-2 text-sm font-semibold transition cursor-pointer ${
                      isActive
                        ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Right Action Buttons */}
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={openSearch}
              className="inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-lg border theme-border bg-white px-3 text-sm font-semibold text-slate-600 transition hover:border-teal-500 hover:bg-slate-50 hover:text-slate-950 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-emerald-400 dark:hover:bg-slate-800 dark:hover:text-white"
              aria-label={t("search")}
              title={t("search")}
            >
              <Search className="h-4 w-4" />
              <span className="hidden text-[11px] text-slate-400 lg:inline">Ctrl K</span>
            </button>

            <ThemeToggle />

            <div
              className="hidden h-10 items-center rounded-lg border theme-border bg-white/70 p-1 text-xs font-bold text-slate-600 dark:bg-slate-950/50 dark:text-slate-300 sm:flex"
              aria-label={t("language")}
            >
              {(["vi", "en"] as const).map((locale) => (
                <button
                  key={locale}
                  type="button"
                  onClick={() => setLanguage(locale)}
                  className={`h-7 rounded-md px-2.5 uppercase transition ${
                    language === locale
                      ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                      : "hover:bg-slate-200 dark:hover:bg-slate-800"
                  }`}
                  aria-pressed={language === locale}
                >
                  {locale}
                </button>
              ))}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="grid h-10 w-10 cursor-pointer place-items-center rounded-lg border theme-border bg-white text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white md:hidden"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="theme-surface border-t theme-border px-4 py-4 shadow-xl shadow-slate-950/5 transition-all md:hidden">
            <ul className="space-y-1">
              {navLinks.map((link) => {
                const isActive = link.href === activeNavHref;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block min-h-11 rounded-lg px-4 py-2.5 text-base font-semibold ${
                        isActive
                          ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                          : "text-slate-600 hover:bg-slate-200 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
              <li>
                <div className="flex items-center gap-2 px-4 py-2">
                  {(["vi", "en"] as const).map((locale) => (
                    <button
                      key={locale}
                      type="button"
                      onClick={() => {
                        setLanguage(locale);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`h-9 rounded-lg px-4 text-sm font-bold uppercase ${
                        language === locale
                          ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                      aria-pressed={language === locale}
                    >
                      {locale}
                    </button>
                  ))}
                </div>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    openSearch();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex min-h-11 w-full items-center gap-2 rounded-lg px-4 py-2.5 text-base font-semibold text-slate-600 hover:bg-slate-200 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <Search className="h-4 w-4" />
                  {t("search")}
                </button>
              </li>
            </ul>
          </div>
        )}
        <SearchModal isOpen={!isSearchPage && isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}

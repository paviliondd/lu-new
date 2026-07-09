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
        <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4">
          {/* Logo */}
          <Link href={localePath("/")} className="group flex min-w-0 items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 text-slate-950 shadow-md shadow-emerald-950/40 transition duration-200 group-hover:scale-105">
              <Cloud className="h-5 w-5" />
            </div>
            <span className="truncate bg-gradient-to-r from-slate-950 to-slate-600 bg-clip-text text-lg font-bold tracking-tight text-transparent dark:from-white dark:to-slate-300">
              Linux<span className="font-extrabold text-emerald-300">Unity</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <ul className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const isActive = link.href === activeNavHref;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition cursor-pointer ${
                      isActive
                        ? "bg-emerald-400/10 text-emerald-300"
                        : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-white"
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
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-600 transition hover:border-emerald-400 hover:text-slate-950 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white"
              aria-label={t("search")}
              title={t("search")}
            >
              <Search className="h-4 w-4" />
              <span className="hidden text-[11px] text-slate-400 lg:inline">Ctrl K</span>
            </button>

            <ThemeToggle />

            <div
              className="hidden h-9 items-center rounded-lg border border-slate-300 bg-white/70 p-1 text-xs font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-300 sm:flex"
              aria-label={t("language")}
            >
              {(["vi", "en"] as const).map((locale) => (
                <button
                  key={locale}
                  type="button"
                  onClick={() => setLanguage(locale)}
                  className={`h-7 rounded-md px-2.5 uppercase transition ${
                    language === locale
                      ? "bg-emerald-400 text-slate-950"
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
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="cursor-pointer rounded-lg p-2 text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 md:hidden"
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
          <div className="theme-surface border-t theme-border px-4 py-4 transition-all md:hidden">
            <ul className="space-y-1">
              {navLinks.map((link) => {
                const isActive = link.href === activeNavHref;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block rounded-lg px-4 py-2.5 text-base font-medium ${
                        isActive
                          ? "bg-emerald-400/10 text-emerald-300"
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
                          ? "bg-emerald-400 text-slate-950"
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
                  className="flex w-full items-center gap-2 rounded-lg px-4 py-2.5 text-base font-medium text-slate-600 hover:bg-slate-200 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
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

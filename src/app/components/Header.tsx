"use client";

import { useEffect, useState } from "react";
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
  const { language, setLanguage, t, localePath } = useLanguage();

  const navLinks = [
    { href: localePath("/blog"), label: t("blog") },
    { href: localePath("/blog/series"), label: t("series") },
    { href: localePath("/about"), label: t("about") },
  ];
  const activeNavHref = navLinks
    .filter((link) => pathname === link.href || pathname.startsWith(`${link.href}/`))
    .sort((left, right) => right.href.length - left.href.length)[0]?.href;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
              onClick={() => setIsSearchOpen(true)}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-600 transition hover:border-emerald-400 hover:text-slate-950 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white"
              aria-label={t("search")}
              title={t("search")}
            >
              <Search className="h-4 w-4" />
              <span className="hidden text-[11px] text-slate-400 lg:inline">Ctrl K</span>
            </button>

            <ThemeToggle />

            {/* Language Switcher */}
            <button
              type="button"
              role="switch"
              aria-checked={language === "en"}
              aria-label={`${t("language")}: ${language.toUpperCase()}`}
              title={`${t("language")}: ${language.toUpperCase()}`}
              onClick={() => setLanguage(language === "vi" ? "en" : "vi")}
              className="relative hidden h-9 w-20 items-center rounded-full border border-slate-300 bg-white p-1 text-[10px] font-extrabold uppercase tracking-wide text-slate-500 transition hover:border-emerald-400/60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 sm:flex"
            >
              <span
                className={`absolute left-1 top-1 h-7 w-9 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 shadow transition-transform duration-200 ${
                  language === "en" ? "translate-x-9" : "translate-x-0"
                }`}
              />
              <span className={`relative z-10 flex-1 text-center ${language === "vi" ? "text-slate-950" : ""}`}>
                VI
              </span>
              <span className={`relative z-10 flex-1 text-center ${language === "en" ? "text-slate-950" : ""}`}>
                EN
              </span>
            </button>

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
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-4 py-2.5 text-base font-medium text-slate-600 hover:bg-slate-200 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <Search className="h-4 w-4" />
                  {t("search")}
                </button>
              </li>
            </ul>
            <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-800">
              <span className="text-xs text-gray-505">{t("language")}</span>
              <div className="flex items-center rounded-lg border border-gray-200 p-0.5 text-xs font-medium dark:border-gray-800">
                <button
                  onClick={() => {
                    setLanguage("vi");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`rounded-md px-2.5 py-1 uppercase transition ${
                    language === "vi"
                      ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                      : "text-gray-550"
                  }`}
                >
                  vi
                </button>
                <button
                  onClick={() => {
                    setLanguage("en");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`rounded-md px-2.5 py-1 uppercase transition ${
                    language === "en"
                      ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                      : "text-gray-550"
                  }`}
                >
                  en
                </button>
              </div>
            </div>
          </div>
        )}
        <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}

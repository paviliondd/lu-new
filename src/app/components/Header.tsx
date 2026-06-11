"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, X, Cloud } from "lucide-react";
import SearchModal from "./SearchModal";
import { useLanguage } from "./LanguageProvider";

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { language, setLanguage, t, localePath } = useLanguage();

  useEffect(() => {
    // Bind keyboard shortcut Ctrl+K / Cmd+K
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navLinks = [
    { href: localePath("/blog"), label: t("blog") },
    { href: localePath("/blog/series"), label: t("series") },
    { href: localePath("/about"), label: t("about") },
  ];
  const activeNavHref = navLinks
    .filter((link) => pathname === link.href || pathname.startsWith(`${link.href}/`))
    .sort((left, right) => right.href.length - left.href.length)[0]?.href;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-[#0B132B]/90 text-slate-100 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          {/* Logo */}
          <Link href={localePath("/")} className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 text-slate-950 shadow-md shadow-emerald-950/40 transition duration-200 group-hover:scale-105">
              <Cloud className="h-5 w-5" />
            </div>
            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-lg font-bold tracking-tight text-transparent">
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
                        : "text-slate-400 hover:bg-slate-800/70 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label={t("search")}
              title={`${t("search")} (Ctrl+K)`}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-400 shadow-sm transition hover:border-cyan-400/70 hover:text-cyan-300"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Language Switcher */}
            <button
              type="button"
              role="switch"
              aria-checked={language === "en"}
              aria-label={`${t("language")}: ${language.toUpperCase()}`}
              title={`${t("language")}: ${language.toUpperCase()}`}
              onClick={() => setLanguage(language === "vi" ? "en" : "vi")}
              className="relative hidden h-9 w-20 items-center rounded-full border border-slate-700 bg-slate-900 p-1 text-[10px] font-extrabold uppercase tracking-wide text-slate-400 transition hover:border-emerald-400/60 sm:flex"
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
              className="cursor-pointer rounded-lg p-2 text-slate-400 hover:bg-slate-800 md:hidden"
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
          <div className="border-t border-slate-800 bg-[#0B132B]/98 px-4 py-4 transition-all md:hidden">
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
                          : "text-slate-400 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
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
      </header>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}

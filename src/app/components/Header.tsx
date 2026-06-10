"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, X, Cloud } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
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

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gray-200/50 bg-white/75 backdrop-blur-md dark:border-gray-800/50 dark:bg-gray-950/75 transition-colors duration-200">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          {/* Logo */}
          <Link href={localePath("/")} className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-blue-600 text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition duration-200">
              <Cloud className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent dark:from-white dark:to-gray-300">
              Linux<span className="text-brand-500 font-extrabold">Unity</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <ul className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition cursor-pointer ${
                      isActive
                        ? "bg-gray-150 text-gray-900 dark:bg-gray-800/80 dark:text-gray-100"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-100"
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
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200/80 bg-white text-gray-500 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400 dark:hover:border-cyan-800 dark:hover:bg-cyan-950/30 dark:hover:text-cyan-300"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Language Switcher */}
            <div className="items-center rounded-lg border border-gray-200 p-0.5 text-xs font-medium dark:border-gray-800 hidden sm:flex">
              <button
                onClick={() => setLanguage("vi")}
                className={`rounded-md px-2 py-1 uppercase cursor-pointer transition ${
                  language === "vi"
                    ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                }`}
              >
                vi
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={`rounded-md px-2 py-1 uppercase cursor-pointer transition ${
                  language === "en"
                    ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                }`}
              >
                en
              </button>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden dark:text-gray-400 dark:hover:bg-gray-800 cursor-pointer"
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
          <div className="border-t border-gray-200 bg-white/95 px-4 py-4 md:hidden dark:border-gray-800 dark:bg-gray-950/95 transition-all">
            <ul className="space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block rounded-lg px-4 py-2.5 text-base font-medium ${
                        isActive
                          ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
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

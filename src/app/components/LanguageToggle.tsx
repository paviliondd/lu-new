"use client";

import { useLanguage } from "./LanguageProvider";
import { Globe } from "lucide-react";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "vi" ? "en" : "vi");
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="inline-flex h-10 items-center gap-1.5 rounded-lg border theme-border bg-white px-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white cursor-pointer"
      aria-label={`Switch language (Current: ${language.toUpperCase()})`}
      title={`Switch to ${language === "vi" ? "English" : "Tiếng Việt"}`}
    >
      <Globe className="h-4 w-4 text-teal-600 dark:text-emerald-400" />
      <span className="font-extrabold uppercase">{language}</span>
    </button>
  );
}

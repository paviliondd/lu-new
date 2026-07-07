"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

type ThemePreference = "system" | "dark" | "light";
type ResolvedTheme = "dark" | "light";

function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return preference;
}

function applyTheme(preference: ThemePreference) {
  const resolvedTheme = resolveTheme(preference);
  document.documentElement.dataset.theme = preference;
  document.documentElement.style.colorScheme = resolvedTheme;
  document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemePreference | null>(null);
  const currentTheme = theme || "system";

  useEffect(() => {
    const readStoredTheme = (): ThemePreference => {
      const storedTheme = localStorage.getItem("theme") as ThemePreference | null;
      const documentTheme = document.documentElement.dataset.theme as ThemePreference | undefined;
      if (storedTheme === "dark" || storedTheme === "light" || storedTheme === "system") {
        return storedTheme;
      }
      if (documentTheme === "dark" || documentTheme === "light" || documentTheme === "system") {
        return documentTheme;
      }
      return "system";
    };

    const initialTheme = readStoredTheme();
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystemTheme = () => {
      if ((localStorage.getItem("theme") || "system") === "system") {
        applyTheme("system");
      }
    };

    applyTheme(initialTheme);
    window.requestAnimationFrame(() => setTheme(initialTheme));
    media.addEventListener("change", syncSystemTheme);

    return () => media.removeEventListener("change", syncSystemTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme: ThemePreference =
      currentTheme === "system" ? "dark" : currentTheme === "dark" ? "light" : "system";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    applyTheme(nextTheme);
  };

  const label =
    currentTheme === "system"
      ? "System theme"
      : currentTheme === "dark"
        ? "Dark theme"
        : "Light theme";

  return (
    <button
      onClick={toggleTheme}
      className="grid h-9 w-9 place-items-center rounded-md border border-slate-300 bg-white text-slate-600 transition hover:border-cyan-400/70 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-cyan-300"
      aria-label={label}
      title={`${label}: System -> Dark -> Light`}
    >
      {currentTheme === "system" ? (
        <Monitor className="h-4 w-4" />
      ) : currentTheme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}

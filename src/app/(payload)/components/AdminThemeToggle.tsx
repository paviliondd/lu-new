"use client";

import { useTheme } from "@payloadcms/ui";
import { Sun, Moon } from "lucide-react";

export default function AdminThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="btn btn--style-secondary btn--size-small inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition"
      title="Toggle Light / Dark Mode"
    >
      {theme === "dark" ? (
        <>
          <Sun className="h-4 w-4 text-amber-400" />
          <span>Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 text-slate-700 dark:text-slate-300" />
          <span>Dark Mode</span>
        </>
      )}
    </button>
  );
}

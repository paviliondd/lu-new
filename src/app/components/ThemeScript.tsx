import React from "react";

export default function ThemeScript() {
  const code = `
    (function() {
      try {
        const preference = localStorage.getItem('theme') || 'system';
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const resolvedTheme = preference === 'system' ? (systemDark ? 'dark' : 'light') : preference;
        document.documentElement.dataset.theme = preference;
        document.documentElement.style.colorScheme = resolvedTheme;
        if (resolvedTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (e) {}
    })();
  `;
  return <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: code }} />;
}

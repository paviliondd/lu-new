import type { Metadata } from "next";
import "../globals.css";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { LanguageProvider } from "@/app/components/LanguageProvider";
import ThemeScript from "@/app/components/ThemeScript";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "LinuxUnity Blog",
    template: "%s — LinuxUnity",
  },
};

export default function LegacyBlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" data-scroll-behavior="auto" suppressHydrationWarning>
      <body className="flex min-h-full flex-col bg-[var(--site-bg)] text-[var(--site-fg)]">
        <ThemeScript />
        <LanguageProvider initialLanguage="vi">
          <a
            href="#main-content"
            className="sr-only z-50 rounded-md bg-[var(--site-surface)] px-4 py-3 font-semibold text-[var(--site-fg)] shadow-lg focus-visible:not-sr-only focus-visible:absolute focus-visible:left-4 focus-visible:top-4"
          >
            Chuyển đến nội dung chính
          </a>
          <Header />
          <main id="main-content" className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { LanguageProvider } from "@/app/components/LanguageProvider";
import ThemeScript from "@/app/components/ThemeScript";
import { hasLocale, locales } from "@/i18n/config";
import { localizedAlternates, siteUrl } from "@/i18n/metadata";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: RootLayoutProps): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};

  const description =
    lang === "vi"
      ? "LinuxUnity chia sẻ hướng dẫn thực hành chuyên sâu về Linux, AWS, Kubernetes, Terraform và CI/CD."
      : "LinuxUnity publishes practical guides about Linux, AWS, Kubernetes, Terraform, and CI/CD.";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: "LinuxUnity — Explore, Build, Share",
      template: "%s — LinuxUnity",
    },
    description,
    alternates: localizedAlternates(lang),
    icons: {
      icon: "/favicon.ico",
    },
  };
}

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  return (
    <html
      lang={lang}
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-[var(--site-bg)] text-[var(--site-fg)]">
        <ThemeScript />
        <LanguageProvider initialLanguage={lang}>
          <Header />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}

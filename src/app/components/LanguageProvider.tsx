"use client";

import React, { createContext, useContext, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  localePath,
  switchLocalePath,
  type Locale,
} from "@/i18n/config";

export type Language = Locale;

const translations = {
  vi: {
    blog: "Blog",
    series: "Series",
    about: "About",
    language: "Language",
    search: "Search",
    searchPlaceholder: "Search posts, series, or tags...",
    recentWriting: "Recent Writing",
    mostRead: "Most Read",
    readBlog: "Start exploring",
    exploreBlog: "Start exploring",
    startExploring: "Start exploring",
    allPosts: "All Posts",
    viewAll: "View All",
    exploreBuildShare: "EXPLORE · LEARN · EVOLVE",
    newsletterTitle: "Newsletter",
    newsletterDesc: "Get notified when a new post is published.",
    newsletterPlaceholder: "Your email address...",
    newsletterSuccess: "Subscribed successfully! Thank you.",
    footerText: "Built with Next.js & Tailwind CSS v4.",
    views: "views",
    readTime: "min read",
    backToBlog: "Back to blog",
    share: "Share this post",
    toc: "Table of Contents",
    noToc: "No table of contents for this post.",
    all: "All",
    resetFilter: "Reset Filters",
    noPosts: "No posts found matching your search.",
    chapters: "Recent Writing",
    parts: "parts in series",
    part: "Part",
    writtenBy: "Written by",
    home: "Home",
    authorTitle: "About Author",
    missionTitle: "What We Do",
    coreTopicsTitle: "Core Focus",
    coreTopicsSubtitle: "Key areas covered by the blog",
    ctaTitle: "Ready for Hands-On Labs?",
    ctaSubtitle: "Start your cloud journey today by reading our high-quality practical guides.",
    ctaButton: "Explore the Blog",
    copiedLink: "Copied!",
    copyCode: "Copy",
    copiedCode: "Copied",
    copyFailed: "Copy failed",
    explainCode: "Explain code",
    noCodeExplanation: "No explanation has been added for this code yet.",
    closeExplainCode: "Close explanation",
    showMoreCode: "Show more",
    showLessCode: "Show less",
    expandCode: "Expand code",
    closeExpandedCode: "Close expanded code",
    shareTwitter: "Share on Twitter",
    copyLinkText: "Copy Link",
    newsletterButton: "Enter email...",
    logoSubtitle: "Deep-dive practical guides on AWS, Kubernetes, Terraform, and CI/CD.",
    heroTitleUnity: "The Unity",
    heroTitleJourney: "Journey",
    heroTitlePart1: "The Unity Journey",
    heroTitlePart2: "",
    heroDesc: "LinuxUnity is a team of engineers sharing what we learn on our journey through DevOps and Cloud.",
    collectionsLabel: "COLLECTIONS",
    exploreBySeries: "Explore by series",
    collections: "Series",
    relatedPosts: "Related Posts",
    searchHint: "Enter keywords to search posts about AWS, Kubernetes, Terraform, CI/CD...",
    noSearchResults: "No matching results found",
    articles: "Articles",
    closeSearch: "Press ESC to close",
    smartSearch: "Smart search by LinuxUnity",
    studyPath: "Knowledge Library",
    blogTitlePart1: "LinuxUnity notes",
    blogTitlePart2: "organized by domain",
    blogDescription: "A practical library covering Linux, cloud platforms, DevOps, automation, and infrastructure security.",
    postCount: "posts",
    seriesCount: "topic series",
    seriesList: "Article Series",
    roadmapPrompt: "Explore the complete learning roadmap organized by exam domain.",
    openRoadmap: "Open roadmap",
    linuxUnitySeries: "LinuxUnity DevOps Series"
  },
  en: {
    blog: "Blog",
    series: "Series",
    about: "About",
    language: "Language",
    search: "Search",
    searchPlaceholder: "Search posts, series, or tags...",
    recentWriting: "Recent Writing",
    mostRead: "Most Read",
    readBlog: "Start exploring",
    exploreBlog: "Start exploring",
    startExploring: "Start exploring",
    allPosts: "All Posts",
    viewAll: "View All",
    exploreBuildShare: "EXPLORE · LEARN · EVOLVE",
    newsletterTitle: "Newsletter",
    newsletterDesc: "Get notified when a new post is published.",
    newsletterPlaceholder: "Your email address...",
    newsletterSuccess: "Subscribed successfully! Thank you.",
    footerText: "Built with Next.js & Tailwind CSS v4.",
    views: "views",
    readTime: "min read",
    backToBlog: "Back to blog",
    share: "Share this post",
    toc: "Table of Contents",
    noToc: "No table of contents for this post.",
    all: "All",
    resetFilter: "Reset Filters",
    noPosts: "No posts found matching your search.",
    chapters: "Recent Writing",
    parts: "parts in series",
    part: "Part",
    writtenBy: "Written by",
    home: "Home",
    authorTitle: "About Author",
    missionTitle: "What We Do",
    coreTopicsTitle: "Core Focus",
    coreTopicsSubtitle: "Key areas covered by the blog",
    ctaTitle: "Ready for Hands-On Labs?",
    ctaSubtitle: "Start your cloud journey today by reading our high-quality practical guides.",
    ctaButton: "Explore the Blog",
    copiedLink: "Copied!",
    copyCode: "Copy",
    copiedCode: "Copied",
    copyFailed: "Copy failed",
    explainCode: "Explain code",
    noCodeExplanation: "No explanation has been added for this code yet.",
    closeExplainCode: "Close explanation",
    showMoreCode: "Show more",
    showLessCode: "Show less",
    expandCode: "Expand code",
    closeExpandedCode: "Close expanded code",
    shareTwitter: "Share on Twitter",
    copyLinkText: "Copy Link",
    newsletterButton: "Enter email...",
    logoSubtitle: "Deep-dive practical guides on AWS, Kubernetes, Terraform, and CI/CD.",
    heroTitleUnity: "The Unity",
    heroTitleJourney: "Journey",
    heroTitlePart1: "The Unity Journey",
    heroTitlePart2: "",
    heroDesc: "LinuxUnity is a team of engineers sharing what we learn on our journey through DevOps and Cloud.",
    collectionsLabel: "COLLECTIONS",
    exploreBySeries: "Explore by series",
    collections: "Series",
    relatedPosts: "Related Posts",
    searchHint: "Enter keywords to search posts about AWS, Kubernetes, Terraform, CI/CD...",
    noSearchResults: "No matching results found",
    articles: "Articles",
    closeSearch: "Press ESC to close",
    smartSearch: "Smart search by LinuxUnity",
    studyPath: "Knowledge Library",
    blogTitlePart1: "LinuxUnity notes",
    blogTitlePart2: "organized by domain",
    blogDescription: "A practical library covering Linux, cloud platforms, DevOps, automation, and infrastructure security.",
    postCount: "posts",
    seriesCount: "topic series",
    seriesList: "Article Series",
    roadmapPrompt: "Explore the complete learning roadmap organized by exam domain.",
    openRoadmap: "Open roadmap",
    linuxUnitySeries: "LinuxUnity DevOps Series"
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.vi) => string;
  localePath: (pathname?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({
  children,
  initialLanguage,
}: {
  children: React.ReactNode;
  initialLanguage: Language;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const language = initialLanguage;

  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem("language", language);
    document.cookie = `linuxunity-locale=${language}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }, [language]);

  const setLanguage = (lang: Language) => {
    if (lang === language) return;
    localStorage.setItem("language", lang);
    document.cookie = `linuxunity-locale=${lang}; Path=/; Max-Age=31536000; SameSite=Lax`;
    router.replace(switchLocalePath(pathname, lang));
  };

  const t = (key: keyof typeof translations.vi) => {
    return translations[language][key] || translations["vi"][key] || String(key);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        localePath: (pathname = "/") => localePath(language, pathname),
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

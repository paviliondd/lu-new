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
    about: "Giới thiệu",
    language: "Ngôn ngữ",
    search: "Tìm kiếm",
    searchPlaceholder: "Tìm kiếm bài viết, series hoặc nhãn (tags)...",
    recentWriting: "Bài viết mới nhất",
    mostRead: "Bài đọc nhiều nhất",
    readBlog: "Đọc bài viết",
    allPosts: "Tất cả bài viết",
    viewAll: "Xem tất cả",
    exploreBuildShare: "HỌC HỎI · THỰC HÀNH · CHIA SẺ",
    newsletterTitle: "NHẬN BẢN TIN",
    newsletterDesc: "Nhận thông báo khi có bài viết mới nhất.",
    newsletterPlaceholder: "Địa chỉ email của bạn...",
    newsletterSuccess: "Đăng ký thành công! Cảm ơn bạn.",
    footerText: "Xây dựng bằng Next.js & Tailwind CSS v4.",
    views: "lượt xem",
    readTime: "phút đọc",
    backToBlog: "Quay lại blog",
    share: "Chia sẻ bài viết",
    toc: "Mục lục bài viết",
    noToc: "Không có mục lục nào cho bài viết này.",
    all: "Tất cả",
    resetFilter: "Đặt lại bộ lọc",
    noPosts: "Không tìm thấy bài viết nào phù hợp với tìm kiếm của bạn.",
    chapters: "Bài viết mới nhất",
    parts: "bài viết trong series",
    part: "Phần",
    writtenBy: "Viết bởi",
    home: "Trang chủ",
    authorTitle: "Về tác giả",
    missionTitle: "Chúng tôi làm những gì?",
    coreTopicsTitle: "Các chủ đề trọng tâm",
    coreTopicsSubtitle: "Lĩnh vực nội dung cốt lõi của blog",
    ctaTitle: "Sẵn sàng trải nghiệm các bài lab thực chiến?",
    ctaSubtitle: "Bắt đầu hành trình nâng cao năng lực Cloud & DevOps của bạn ngay hôm nay bằng việc đọc các bài viết chất lượng cao của chúng tôi.",
    ctaButton: "Khám phá Blog bài viết",
    copiedLink: "Đã sao chép!",
    copyCode: "Sao chép",
    copiedCode: "Đã sao chép",
    copyFailed: "Không thể sao chép",
    explainCode: "Giải thích code",
    closeExplainCode: "Đóng giải thích",
    showMoreCode: "Xem thêm",
    showLessCode: "Thu gọn",
    shareTwitter: "Chia sẻ Twitter",
    copyLinkText: "Sao chép liên kết",
    newsletterButton: "Nhập email...",
    logoSubtitle: "Kênh chia sẻ kiến thức, hướng dẫn thực hành chuyên sâu về AWS, Kubernetes, Terraform và CI/CD.",
    heroTitlePart1: "Hành trình chinh phục ",
    heroTitlePart2: "Cloud & DevOps",
    heroDesc: "Nơi ghi lại những gì mình đang tìm hiểu, từ kiến thức nền tảng đến các bài lab thực hành thực tế. Tìm hiểu đến đâu, chia sẻ đến đó với mục tiêu tự động hóa và tối ưu hóa mọi hạ tầng.",
    collections: "Series",
    relatedPosts: "Bài viết liên quan",
    searchHint: "Nhập từ khóa để tìm kiếm các bài viết về AWS, Kubernetes, Terraform, CI/CD...",
    noSearchResults: "Không tìm thấy kết quả phù hợp",
    articles: "Bài viết",
    closeSearch: "Nhấn ESC để đóng",
    smartSearch: "Tìm kiếm thông minh bởi LinuxUnity",
    studyPath: "Thư viện Cloud & DevOps",
    blogTitlePart1: "Ghi chú LinuxUnity",
    blogTitlePart2: "theo miền kiến thức hạ tầng",
    blogDescription: "Thư viện bài viết thực chiến về Linux, Cloud, DevOps, tự động hóa và bảo mật hạ tầng.",
    postCount: "bài viết",
    seriesCount: "series chủ đề",
    seriesList: "Series bài viết",
    roadmapPrompt: "Xem lộ trình học đầy đủ theo thứ tự exam domain.",
    openRoadmap: "Mở roadmap",
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
    readBlog: "Read the Blog",
    allPosts: "All Posts",
    viewAll: "View All",
    exploreBuildShare: "Learn · Practice · Share",
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
    chapters: "Chapters List",
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
    closeExplainCode: "Close explanation",
    showMoreCode: "Show more",
    showLessCode: "Show less",
    shareTwitter: "Share on Twitter",
    copyLinkText: "Copy Link",
    newsletterButton: "Enter email...",
    logoSubtitle: "Deep-dive practical guides on AWS, Kubernetes, Terraform, and CI/CD.",
    heroTitlePart1: "The journey to master ",
    heroTitlePart2: "Cloud & DevOps",
    heroDesc: "Notes from an ongoing learning journey, from core concepts to practical labs. Learn, share, automate, and optimize infrastructure along the way.",
    collections: "Collections",
    relatedPosts: "Related posts",
    searchHint: "Enter keywords to search posts about AWS, Kubernetes, Terraform, CI/CD...",
    noSearchResults: "No matching results found",
    articles: "Articles",
    closeSearch: "Press ESC to close",
    smartSearch: "Smart search by LinuxUnity",
    studyPath: "Cloud & DevOps Library",
    blogTitlePart1: "LinuxUnity notes",
    blogTitlePart2: "organized by infrastructure domain",
    blogDescription: "A practical library covering Linux, cloud platforms, DevOps, automation, and infrastructure security.",
    postCount: "posts",
    seriesCount: "topic series",
    seriesList: "Article series",
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
    router.push(switchLocalePath(pathname, lang));
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

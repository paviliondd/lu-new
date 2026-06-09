"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "vi" | "en";

export const translations = {
  vi: {
    blog: "Blog",
    series: "Chuyên đề",
    about: "Giới thiệu",
    language: "Ngôn ngữ",
    search: "Tìm kiếm",
    searchPlaceholder: "Tìm kiếm bài viết, chuyên đề hoặc nhãn (tags)...",
    recentWriting: "Bài viết mới nhất",
    mostRead: "Bài đọc nhiều nhất",
    readBlog: "Đọc bài viết",
    allPosts: "Tất cả bài viết",
    viewAll: "Xem tất cả",
    exploreBuildShare: "Khám phá · Xây dựng · Chia sẻ",
    newsletterTitle: "Nhận bản tin DevOps",
    newsletterDesc: "Nhận thông báo khi có bài viết hoặc hướng dẫn lab mới nhất. Không spam.",
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
    chapters: "Danh sách các bài học",
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
    shareTwitter: "Chia sẻ Twitter",
    copyLinkText: "Sao chép liên kết",
    newsletterButton: "Nhập email...",
    logoSubtitle: "Kênh chia sẻ kiến thức, hướng dẫn thực hành chuyên sâu về AWS, Kubernetes, Terraform và CI/CD.",
    heroTitlePart1: "Chúng tôi xây dựng hệ thống và ",
    heroTitlePart2: "viết về nó",
    heroDesc: "Kênh chia sẻ kiến thức thực tế về Cloud & DevOps. Chúng tôi thiết kế hạ tầng tự động hóa, kiểm thử khả năng chịu tải và ghi chép lại mọi kinh nghiệm thu được."
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
    exploreBuildShare: "Explore · Build · Share",
    newsletterTitle: "DevOps Newsletter",
    newsletterDesc: "Get notified of new posts and hands-on labs. No spam.",
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
    shareTwitter: "Share on Twitter",
    copyLinkText: "Copy Link",
    newsletterButton: "Enter email...",
    logoSubtitle: "Deep-dive practical guides on AWS, Kubernetes, Terraform, and CI/CD.",
    heroTitlePart1: "We build systems and ",
    heroTitlePart2: "write about it",
    heroDesc: "A blog sharing practical knowledge about Cloud & DevOps. We design automated infrastructure, run load testing, and document our findings."
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.vi) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("vi");

  useEffect(() => {
    const savedLang = localStorage.getItem("language") as Language;
    if (savedLang === "vi" || savedLang === "en") {
      const langTimer = window.setTimeout(() => setLanguageState(savedLang), 0);
      return () => window.clearTimeout(langTimer);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: keyof typeof translations.vi) => {
    return translations[language][key] || translations["vi"][key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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

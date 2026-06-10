"use client";

import Link from "next/link";
import { ChevronRight, Cloud, Code, Shield, Cpu, ArrowRight } from "lucide-react";
import { useLanguage } from "@/app/components/LanguageProvider";

export default function AboutPage() {
  const { t, language, localePath } = useLanguage();

  const missionItems = [
    {
      icon: <Cloud className="h-6 w-6 text-brand-650 dark:text-brand-400" />,
      title: "Cloud Computing",
      desc: language === "vi" 
        ? "Nghiên cứu sâu các dịch vụ trên AWS, Azure, Google Cloud để xây dựng các giải pháp tối ưu chi phí và hiệu năng."
        : "Deep dive into AWS, Azure, and Google Cloud services to build cost-effective and high-performance solutions.",
    },
    {
      icon: <Code className="h-6 w-6 text-brand-650 dark:text-brand-400" />,
      title: "Automation & IaC",
      desc: language === "vi"
        ? "Thay thế các thao tác cấu hình thủ công bằng Code (Terraform, Ansible, CloudFormation), kiểm soát phiên bản qua Git."
        : "Replace manual configuration tasks with Code (Terraform, Ansible, CloudFormation), version controlled via Git.",
    },
    {
      icon: <Shield className="h-6 w-6 text-brand-650 dark:text-brand-400" />,
      title: "DevSecOps",
      desc: language === "vi"
        ? "Tích hợp bảo mật vào quy trình CI/CD từ sớm (Shift-Left Security), kiểm thử mã nguồn tĩnh (SAST), động (DAST)."
        : "Integrate security early in the CI/CD pipeline (Shift-Left), scanning static (SAST) and dynamic (DAST) code.",
    },
    {
      icon: <Cpu className="h-6 w-6 text-brand-650 dark:text-brand-400" />,
      title: "Platform Engineering",
      desc: language === "vi"
        ? "Xây dựng các Cổng thông tin tự phục vụ dành cho lập trình viên (Developer Portals), giảm tải vận hành hạ tầng."
        : "Build internal developer self-service portals (Developer Portals) to reduce infrastructure operations load.",
    },
  ];

  return (
    <div className="w-full bg-white dark:bg-gray-950 min-h-screen py-12 transition-colors duration-200">
      <div className="mx-auto max-w-6xl px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-6">
          <Link href={localePath("/")} className="hover:text-brand-650 transition">{t("home")}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-900 dark:text-gray-100 font-medium">{t("about")}</span>
        </div>

        {/* Title area */}
        <div className="mb-12 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
            {t("about")}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            {t("logoSubtitle")}
          </p>
        </div>

        {/* Core Sections */}
        <div className="space-y-16">
          {/* Section 1: Introduction */}
          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div className="space-y-4 text-sm leading-relaxed text-gray-650 dark:text-gray-400">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t("missionTitle")}
              </h2>
              {language === "vi" ? (
                <>
                  <p>
                    Tại LinuxUnity, chúng tôi không chỉ viết lý thuyết. Mỗi bài lab được thiết lập theo hướng thực chiến: xây dựng hệ thống serverless hoàn chỉnh, giả lập và bắn hàng chục ngàn request để kiểm thử tải (Load testing), hoặc thiết kế các đường ống CI/CD có khả năng tự động rollback khi phát hiện lỗi.
                  </p>
                  <p>
                    Tất cả mã nguồn triển khai (IaC code, script, test code) trong mỗi bài viết đều được chia sẻ công khai trên GitHub để bạn có thể tự mình chạy thử (Demo) và dọn dẹp sạch sẽ sau khi hoàn thành.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    At LinuxUnity, the articles do not stop at theory. Each guide is built around practical labs: complete serverless systems, load tests with tens of thousands of simulated requests, or CI/CD pipelines that can automatically rollback when errors are detected.
                  </p>
                  <p>
                    Deployment source code (IaC code, scripts, test code) is shared publicly on GitHub so you can run the demo yourself and clean it up after completion.
                  </p>
                </>
              )}
            </div>
            
            {/* Mission Illustration (Decorative Gradient Block) */}
            <div className="relative aspect-video sm:aspect-[4/3] md:aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-brand-500/80 via-blue-500 to-indigo-600/90 shadow-lg flex items-center justify-center p-8 text-center text-white">
              <div className="space-y-2">
                <Cloud className="h-14 w-14 mx-auto text-white/95 animate-pulse" />
                <h3 className="text-lg font-extrabold">{t("exploreBuildShare")}</h3>
                <p className="text-xs text-white/80 max-w-xs mx-auto">
                  {language === "vi"
                    ? "Khám phá công nghệ mới, xây dựng dự án thật và chia sẻ bài học kinh nghiệm."
                    : "Discover new technologies, build real-world projects, and share lessons learned."}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Mission Items Grid */}
          <div className="space-y-8">
            <div className="text-center md:text-left">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t("coreTopicsTitle")}
              </h2>
              <p className="text-xs text-gray-505 dark:text-gray-405 mt-1">
                {t("coreTopicsSubtitle")}
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {missionItems.map((item, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-gray-150 p-6 bg-white dark:border-gray-800 dark:bg-gray-900/50 hover:shadow-md transition duration-200"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-950/60">
                    {item.icon}
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Call to Action */}
          <div className="rounded-2xl bg-gradient-to-r from-brand-600 to-blue-600 p-8 sm:p-12 text-center text-white shadow-xl shadow-brand-500/10">
            <h2 className="text-xl sm:text-2xl font-extrabold">
              {t("ctaTitle")}
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-white/85 max-w-md mx-auto leading-relaxed">
              {t("ctaSubtitle")}
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href={localePath("/blog")}
                className="inline-flex h-11 items-center rounded-xl bg-white px-6 text-xs font-bold text-brand-700 shadow hover:shadow-lg hover:bg-gray-50 transition cursor-pointer"
              >
                {t("ctaButton")}
                <ArrowRight className="ml-1.5 h-4 w-4 text-brand-705" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

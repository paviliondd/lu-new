"use client";

import Link from "next/link";
import { ChevronRight, Cloud, Code, Shield, Cpu, ArrowRight } from "lucide-react";
import { useLanguage } from "@/app/components/LanguageProvider";

export default function AboutPage() {
  const { t, language, localePath } = useLanguage();

  const missionItems = [
    {
      icon: <Cloud className="h-5 w-5" />,
      title: "Cloud Computing",
      desc: language === "vi" 
        ? "Nghiên cứu sâu các dịch vụ trên AWS, Azure, Google Cloud để xây dựng các giải pháp tối ưu chi phí và hiệu năng."
        : "Deep dive into AWS, Azure, and Google Cloud services to build cost-effective and high-performance solutions.",
    },
    {
      icon: <Code className="h-5 w-5" />,
      title: "Automation & IaC",
      desc: language === "vi"
        ? "Thay thế các thao tác cấu hình thủ công bằng Code (Terraform, Ansible, CloudFormation), kiểm soát phiên bản qua Git."
        : "Replace manual configuration tasks with Code (Terraform, Ansible, CloudFormation), version controlled via Git.",
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "DevSecOps",
      desc: language === "vi"
        ? "Tích hợp bảo mật vào quy trình CI/CD từ sớm (Shift-Left Security), kiểm thử mã nguồn tĩnh (SAST), động (DAST)."
        : "Integrate security early in the CI/CD pipeline (Shift-Left), scanning static (SAST) and dynamic (DAST) code.",
    },
    {
      icon: <Cpu className="h-5 w-5" />,
      title: "Platform Engineering",
      desc: language === "vi"
        ? "Xây dựng các Cổng thông tin tự phục vụ dành cho lập trình viên (Developer Portals), giảm tải vận hành hạ tầng."
        : "Build internal developer self-service portals (Developer Portals) to reduce infrastructure operations load.",
    },
  ];

  return (
    <div className="theme-page min-h-screen w-full py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-1 text-xs theme-muted">
          <Link href={localePath("/")} className="transition hover:text-teal-700 dark:hover:text-emerald-300">{t("home")}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-slate-900 dark:text-slate-100">{t("about")}</span>
        </div>

        {/* Title area */}
        <div className="mb-12 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700 dark:text-emerald-300">
            LinuxUnity
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            {t("about")}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 theme-muted">
            {t("logoSubtitle")}
          </p>
        </div>

        {/* Core Sections */}
        <div className="space-y-14">
          {/* Section 1: Introduction */}
          <div className="grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
            <div className="space-y-4 text-base leading-7 theme-muted">
              <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
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
            <div className="theme-card relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border p-8 text-center sm:aspect-[4/3] md:aspect-square">
              <div className="space-y-2">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border theme-border bg-white text-teal-700 dark:bg-slate-900 dark:text-emerald-300">
                  <Cloud className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-950 dark:text-white">{t("exploreBuildShare")}</h3>
                <p className="mx-auto max-w-xs text-sm leading-6 theme-muted">
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
              <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
                {t("coreTopicsTitle")}
              </h2>
              <p className="mt-2 text-sm theme-muted">
                {t("coreTopicsSubtitle")}
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {missionItems.map((item, index) => (
                <div
                  key={index}
                  className="theme-card rounded-xl border p-5 transition duration-200 hover:-translate-y-0.5 hover:border-teal-500/50 hover:shadow-lg dark:hover:border-emerald-400/50"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border theme-border bg-white text-teal-700 dark:bg-slate-900 dark:text-emerald-300">
                    {item.icon}
                  </div>
                  <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 theme-muted">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Call to Action */}
          <div className="theme-card rounded-xl border p-8 text-center sm:p-10">
            <h2 className="text-xl font-bold text-slate-950 dark:text-white sm:text-2xl">
              {t("ctaTitle")}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 theme-muted">
              {t("ctaSubtitle")}
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href={localePath("/blog")}
                className="inline-flex h-11 items-center rounded-lg bg-slate-950 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              >
                {t("ctaButton")}
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

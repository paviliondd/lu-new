import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import "./projects/projects.css";
import ProjectHeader from "./projects/components/ProjectHeader";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = { metadataBase: new URL("https://project.linuxunity.com") };

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${geistSans.variable} ${geistMono.variable} dark antialiased`}>
      <body className="projects-site">
        <a className="project-skip" href="#main-content">Bỏ qua điều hướng</a>
        <ProjectHeader />
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}

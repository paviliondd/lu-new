import type { Metadata } from "next";
import ProjectTimeline from "./components/ProjectTimeline";
import { getCmsProjects } from "@/lib/cms/projects";

const description = "AWS, DevOps, Linux and cloud engineering projects by LinuxUnity.";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Projects | LinuxUnity",
  description,
  alternates: { canonical: "https://project.linuxunity.com/" },
  openGraph: { title: "Projects | LinuxUnity", description, url: "https://project.linuxunity.com/", siteName: "LinuxUnity", locale: "en_US", type: "website" },
  twitter: { card: "summary_large_image", title: "Projects | LinuxUnity", description },
};

export default async function ProjectsPage() {
  const projects = await getCmsProjects();
  const technologies = new Set(projects.flatMap((project) => project.tags)).size;
  return (
    <>
      <header className="project-hero">
        <div className="project-shell">
          <div className="project-eyebrow">AWS · DEVOPS · LINUX</div>
          <h1>Projects</h1>
          <p>Hands-on cloud infrastructure, automation, observability, and platform engineering projects.</p>
          <div className="project-stats" aria-label="Project statistics">
            <span><strong>{projects.length}</strong> projects</span>
            <span><strong>{technologies}</strong> technologies</span>
            <span>Latest: <strong>{projects[0]?.displayDate || "—"}</strong></span>
          </div>
        </div>
      </header>
      <ProjectTimeline projects={projects} />
    </>
  );
}

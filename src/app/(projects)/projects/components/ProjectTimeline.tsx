"use client";

import Link from "next/link";
import { ArrowRight, Check, CloudCog } from "lucide-react";
import { useMemo, useState } from "react";
import type { Project } from "@/content/projects/schema";

const requestedFilters = ["All", "AWS", "DevOps", "Linux", "Kubernetes", "Terraform", "Observability"] as const;

export default function ProjectTimeline({ projects }: { projects: Project[] }) {
  const filters = requestedFilters.filter((filter) => filter === "All" || projects.some((project) => project.category === filter || project.tags.includes(filter)));
  const [activeFilter, setActiveFilter] = useState<(typeof requestedFilters)[number]>("All");
  const visibleProjects = useMemo(() => activeFilter === "All" ? projects : projects.filter((project) => project.category === activeFilter || project.tags.includes(activeFilter)), [activeFilter, projects]);

  return (
    <section className="project-timeline-section project-shell" aria-labelledby="timeline-heading">
      <h2 id="timeline-heading" className="sr-only">Project timeline</h2>
      <div className="project-filters" aria-label="Filter projects">
        {filters.map((filter) => (
          <button key={filter} type="button" className="project-filter" aria-pressed={activeFilter === filter} onClick={() => setActiveFilter(filter)}>{filter}</button>
        ))}
      </div>
      {visibleProjects.length ? (
        <ol className="project-timeline">
          {visibleProjects.map((project) => (
            <li className="project-timeline__item" key={project.slug}>
              <span className="project-node" aria-hidden />
              <time className="project-date" dateTime={project.startDate}>{project.displayDate}</time>
              <Link className="project-card" href={`/projects/${project.slug}`}>
                <div className="project-card__top">
                  <span className="project-card__icon" aria-hidden><CloudCog size={22} /></span>
                  <div><h2>{project.title}</h2><p className="project-card__meta">{project.type} · {project.displayDate}</p></div>
                </div>
                {project.placeholder && <span className="project-placeholder">Placeholder content</span>}
                <p className="project-card__summary">{project.summary}</p>
                <ul className="project-highlights">{project.highlights.map((highlight) => <li key={highlight}><Check aria-hidden size={14} /><span>{highlight}</span></li>)}</ul>
                <div className="project-tags" aria-label="Technologies">{project.tags.map((tag) => <span className="project-tag" key={tag}>{tag}</span>)}</div>
                <span className="project-card__cta">View project <ArrowRight aria-hidden size={16} /></span>
              </Link>
            </li>
          ))}
        </ol>
      ) : <p className="project-empty">Chưa có project trong nhóm này.</p>}
    </section>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { projects as fallbackProjects } from "@/content/projects/projects";
import { getCmsProject, getCmsProjects } from "@/lib/cms/projects";

type Props = { params: Promise<{ slug: string }> };

const statusLabels = { completed: "Completed", "in-progress": "In progress", archived: "Archived" } as const;

function GitHubMark() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
      <path d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2.23c-3.22.7-3.9-1.37-3.9-1.37-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.57-.29-5.27-1.28-5.27-5.68 0-1.26.45-2.28 1.19-3.08-.12-.29-.52-1.47.11-3.05 0 0 .97-.31 3.16 1.18a10.9 10.9 0 0 1 5.75 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.58.23 2.76.11 3.05.74.8 1.19 1.82 1.19 3.08 0 4.41-2.7 5.38-5.28 5.67.42.36.79 1.06.79 2.14v3.18c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z" />
    </svg>
  );
}

export const revalidate = 60;
export const dynamicParams = true;

export function generateStaticParams() {
  return fallbackProjects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getCmsProject(slug);
  if (!project) return {};
  const url = `https://project.linuxunity.com/${project.slug}`;
  const title = project.title;
  const description = project.summary;
  return {
    title: `${title} | LinuxUnity Projects`,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "LinuxUnity", locale: "en_US", type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getCmsProject(slug);
  if (!project) notFound();
  const projects = await getCmsProjects();
  const index = projects.findIndex((item) => item.slug === project.slug);
  const previous = projects[index - 1];
  const next = projects[index + 1];
  const repositoryValue = project.repositoryUrl ? new URL(project.repositoryUrl).hostname : "Not published";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary,
    url: `https://project.linuxunity.com/${project.slug}`,
    inLanguage: "en",
    keywords: project.tags.join(", "),
    creator: { "@type": "Organization", name: "LinuxUnity", url: "https://linuxunity.com" },
  };

  return (
    <article className="project-detail project-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Link className="project-back" href="/"><ArrowLeft aria-hidden size={17} /> Back to projects</Link>
      <nav className="project-breadcrumb" aria-label="Breadcrumb"><Link href="/">Projects</Link> <span aria-hidden>/</span> <span aria-current="page">{project.title}</span></nav>

      <header className="project-detail-hero">
        <div className="project-eyebrow">{project.category} · {project.type}</div>
        <h1>{project.title}</h1>
        <p className="project-detail-hero__summary">{project.summary}</p>
        {project.placeholder && <span className="project-placeholder">Placeholder content</span>}
        <div className="project-tags" aria-label="Technologies">{project.tags.map((tag) => <span className="project-tag" key={tag}>{tag}</span>)}</div>
        {(project.repositoryUrl || project.demoUrl || project.articleUrl) && (
          <div className="project-actions">
            {project.repositoryUrl && <a className="project-action" href={project.repositoryUrl}><GitHubMark /> GitHub</a>}
            {project.demoUrl && <a className="project-action" href={project.demoUrl}><ExternalLink aria-hidden size={17} /> Live demo</a>}
            {project.articleUrl && <a className="project-action" href={project.articleUrl}><ExternalLink aria-hidden size={17} /> Related article</a>}
          </div>
        )}
        <dl className="project-summary-grid">
          <div className="project-summary-item"><dt>Role</dt><dd>{project.role}</dd></div>
          <div className="project-summary-item"><dt>Timeline</dt><dd>{project.displayDate}</dd></div>
          <div className="project-summary-item"><dt>Type</dt><dd>{project.type}</dd></div>
          <div className="project-summary-item"><dt>Status</dt><dd>{statusLabels[project.status]}</dd></div>
          <div className="project-summary-item"><dt>Infrastructure</dt><dd>{project.tags.slice(0, 3).join(" · ")}</dd></div>
          <div className="project-summary-item"><dt>Repository</dt><dd>{repositoryValue}</dd></div>
        </dl>
        {project.metrics?.length ? <dl className="project-summary-grid">{project.metrics.slice(0, 3).map((metric) => <div className="project-summary-item" key={metric.label}><dt>{metric.label}</dt><dd>{metric.value}</dd></div>)}</dl> : null}
      </header>

      <section className="project-section project-measure"><h2>Problem</h2><p className="project-section__intro">{project.problem}</p>{project.description && <p className="project-section__intro">{project.description}</p>}{project.constraints?.length ? <><h3>Constraints</h3><ul className="project-list">{project.constraints.map((item) => <li key={item}>{item}</li>)}</ul></> : null}{project.successCriteria?.length ? <><h3>Success criteria</h3><ul className="project-list">{project.successCriteria.map((item) => <li key={item}>{item}</li>)}</ul></> : null}</section>

      <section className="project-section"><h2>Architecture</h2><p className="project-section__intro project-measure">The architecture separates clear responsibilities so each component can be tested, operated, and changed independently.</p>{project.architectureImage && project.architectureAlt ? <figure className="project-architecture"><a href={project.architectureImage} aria-label={`View the full-size ${project.title} architecture diagram`}><Image src={project.architectureImage} alt={project.architectureAlt} width={1200} height={675} sizes="(max-width: 768px) 100vw, 1152px" /></a>{project.architectureCaption && <figcaption>{project.architectureCaption}</figcaption>}</figure> : null}{project.architectureComponents?.length ? <div className="project-component-grid">{project.architectureComponents.map((component) => <div className="project-info-card" key={component.name}><h3>{component.name}</h3><p>{component.description}</p></div>)}</div> : null}</section>

      <section className="project-section"><h2>Implementation</h2><p className="project-section__intro project-measure">The work is organized into phases with explicit tools and verifiable outputs.</p><ol className="project-phases">{project.implementation.map((item) => <li className="project-phase" key={item.phase}><span className="project-phase__label">{item.phase}</span><div><h3>{item.title}</h3><p>{item.description}</p><div className="project-phase__meta">Tools: {item.tools.join(" · ")} · Output: {item.output}</div>{item.links?.map((link) => <a className="project-action" href={link.url} key={link.url}>{link.label}<ExternalLink aria-hidden size={15} /></a>)}</div></li>)}</ol></section>

      {project.decisions?.length ? <section className="project-section"><h2>Technical decisions</h2><table className="project-table"><thead><tr><th>Decision</th><th>Choice</th><th>Reason</th></tr></thead><tbody>{project.decisions.map((item) => <tr key={item.decision}><td data-label="Decision">{item.decision}</td><td data-label="Choice">{item.choice}</td><td data-label="Reason">{item.reason}</td></tr>)}</tbody></table></section> : null}

      {project.security?.length ? <section className="project-section project-measure"><h2>Security</h2><p className="project-section__intro">These items describe concrete controls or work that still requires verification.</p><ul className="project-list">{project.security.map((item) => <li key={item}>{item}</li>)}</ul></section> : null}
      {project.observability?.length ? <section className="project-section project-measure"><h2>Observability</h2><ul className="project-list">{project.observability.map((item) => <li key={item}>{item}</li>)}</ul></section> : null}
      <section className="project-section project-measure"><h2>Results</h2><ul className="project-list">{project.results.map((item) => <li key={item}>{item}</li>)}</ul></section>
      <section className="project-section"><h2>Challenges and lessons learned</h2><div className="project-challenge-grid">{project.challenges.map((challenge) => <div className="project-info-card" key={challenge.problem}><h3>Challenge</h3><p>{challenge.problem}</p><h3>Approach</h3><p>{challenge.solution}</p><h3>Lesson</h3><p>{challenge.lesson}</p></div>)}</div></section>
      {project.gallery?.length ? <section className="project-section"><h2>Evidence gallery</h2><div className="project-component-grid">{project.gallery.map((image) => <figure className="project-architecture" key={image.src}><Image src={image.src} alt={image.alt} width={800} height={450} loading="lazy" />{image.caption && <figcaption>{image.caption}</figcaption>}</figure>)}</div></section> : null}

      <nav className="project-footer-nav" aria-label="Project pagination">
        {previous ? <Link href={`/${previous.slug}`}><span className="project-footer-nav__label">← Previous project</span><strong>{previous.title}</strong></Link> : <span />}
        <Link href="/"><span className="project-footer-nav__label">Timeline</span><strong>All projects</strong></Link>
        {next ? <Link href={`/${next.slug}`}><span className="project-footer-nav__label">Next project →</span><strong>{next.title}</strong></Link> : <span />}
      </nav>
    </article>
  );
}

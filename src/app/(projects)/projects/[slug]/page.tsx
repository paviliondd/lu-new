import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Code2, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { projects as fallbackProjects } from "@/content/projects/projects";
import { getCmsProject, getCmsProjects } from "@/lib/cms/projects";

type Props = { params: Promise<{ slug: string }> };

const statusLabels = { completed: "Completed", "in-progress": "In progress", archived: "Archived" } as const;

export const revalidate = 60;
export const dynamicParams = true;

export function generateStaticParams() {
  return fallbackProjects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getCmsProject(slug);
  if (!project) return {};
  const url = `https://project.linuxunity.com/projects/${project.slug}`;
  const title = project.title;
  const description = project.summary;
  return {
    title: `${title} | LinuxUnity Projects`,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "LinuxUnity", locale: "vi_VN", type: "article" },
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
  const repositoryValue = project.repositoryUrl ? new URL(project.repositoryUrl).hostname : "Chưa công bố";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary,
    url: `https://project.linuxunity.com/projects/${project.slug}`,
    inLanguage: "vi",
    keywords: project.tags.join(", "),
    creator: { "@type": "Organization", name: "LinuxUnity", url: "https://linuxunity.com" },
  };

  return (
    <article className="project-detail project-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Link className="project-back" href="/projects"><ArrowLeft aria-hidden size={17} /> Back to projects</Link>
      <nav className="project-breadcrumb" aria-label="Breadcrumb"><Link href="/projects">Projects</Link> <span aria-hidden>/</span> <span aria-current="page">{project.title}</span></nav>

      <header className="project-detail-hero">
        <div className="project-eyebrow">{project.category} · {project.type}</div>
        <h1>{project.title}</h1>
        <p className="project-detail-hero__summary">{project.summary}</p>
        {project.placeholder && <span className="project-placeholder">Placeholder content</span>}
        <div className="project-tags" aria-label="Technologies">{project.tags.map((tag) => <span className="project-tag" key={tag}>{tag}</span>)}</div>
        {(project.repositoryUrl || project.demoUrl || project.articleUrl) && (
          <div className="project-actions">
            {project.repositoryUrl && <a className="project-action" href={project.repositoryUrl}><Code2 aria-hidden size={17} /> GitHub</a>}
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

      <section className="project-section"><h2>Architecture</h2><p className="project-section__intro project-measure">Kiến trúc được chia thành các thành phần có trách nhiệm rõ ràng để có thể kiểm thử và thay đổi độc lập.</p>{project.architectureImage && project.architectureAlt ? <figure className="project-architecture"><a href={project.architectureImage} aria-label={`Xem sơ đồ ${project.title} ở kích thước đầy đủ`}><Image src={project.architectureImage} alt={project.architectureAlt} width={1200} height={675} sizes="(max-width: 768px) 100vw, 1152px" /></a>{project.architectureCaption && <figcaption>{project.architectureCaption}</figcaption>}</figure> : null}{project.architectureComponents?.length ? <div className="project-component-grid">{project.architectureComponents.map((component) => <div className="project-info-card" key={component.name}><h3>{component.name}</h3><p>{component.description}</p></div>)}</div> : null}</section>

      <section className="project-section"><h2>Implementation</h2><p className="project-section__intro project-measure">Quá trình được chia theo phase; các output placeholder sẽ được thay bằng link hoặc evidence thật khi hoàn tất.</p><ol className="project-phases">{project.implementation.map((item) => <li className="project-phase" key={item.phase}><span className="project-phase__label">{item.phase}</span><div><h3>{item.title}</h3><p>{item.description}</p><div className="project-phase__meta">Tools: {item.tools.join(" · ")} · Output: {item.output}</div>{item.links?.map((link) => <a className="project-action" href={link.url} key={link.url}>{link.label}<ExternalLink aria-hidden size={15} /></a>)}</div></li>)}</ol></section>

      {project.decisions?.length ? <section className="project-section"><h2>Technical decisions</h2><table className="project-table"><thead><tr><th>Decision</th><th>Choice</th><th>Reason</th></tr></thead><tbody>{project.decisions.map((item) => <tr key={item.decision}><td data-label="Decision">{item.decision}</td><td data-label="Choice">{item.choice}</td><td data-label="Reason">{item.reason}</td></tr>)}</tbody></table></section> : null}

      {project.security?.length ? <section className="project-section project-measure"><h2>Security</h2><p className="project-section__intro">Các mục dưới đây mô tả control cụ thể hoặc công việc còn chờ kiểm chứng; không phải tuyên bố bảo mật chung chung.</p><ul className="project-list">{project.security.map((item) => <li key={item}>{item}</li>)}</ul></section> : null}
      {project.observability?.length ? <section className="project-section project-measure"><h2>Observability</h2><ul className="project-list">{project.observability.map((item) => <li key={item}>{item}</li>)}</ul></section> : null}
      <section className="project-section project-measure"><h2>Results</h2><ul className="project-list">{project.results.map((item) => <li key={item}>{item}</li>)}</ul></section>
      <section className="project-section"><h2>Challenges and lessons learned</h2><div className="project-challenge-grid">{project.challenges.map((challenge) => <div className="project-info-card" key={challenge.problem}><h3>Challenge</h3><p>{challenge.problem}</p><h3>Approach</h3><p>{challenge.solution}</p><h3>Lesson</h3><p>{challenge.lesson}</p></div>)}</div></section>
      {project.gallery?.length ? <section className="project-section"><h2>Evidence gallery</h2><div className="project-component-grid">{project.gallery.map((image) => <figure className="project-architecture" key={image.src}><Image src={image.src} alt={image.alt} width={800} height={450} loading="lazy" />{image.caption && <figcaption>{image.caption}</figcaption>}</figure>)}</div></section> : null}

      <nav className="project-footer-nav" aria-label="Project pagination">
        {previous ? <Link href={`/projects/${previous.slug}`}><span className="project-footer-nav__label">← Project trước</span><strong>{previous.title}</strong></Link> : <span />}
        <Link href="/projects"><span className="project-footer-nav__label">Timeline</span><strong>All projects</strong></Link>
        {next ? <Link href={`/projects/${next.slug}`}><span className="project-footer-nav__label">Project tiếp theo →</span><strong>{next.title}</strong></Link> : <span />}
      </nav>
    </article>
  );
}

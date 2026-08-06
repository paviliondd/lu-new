import Link from "next/link";

export default function ProjectNotFound() {
  return <div className="project-shell project-detail"><div className="project-eyebrow">404</div><h1>Project not found</h1><p className="project-section__intro">This URL does not match a published project.</p><Link className="project-action" href="/">Back to projects</Link></div>;
}

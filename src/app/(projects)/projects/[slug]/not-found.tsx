import Link from "next/link";

export default function ProjectNotFound() {
  return <div className="project-shell project-detail"><div className="project-eyebrow">404</div><h1>Project không tồn tại</h1><p className="project-section__intro">Slug này không khớp với project đã được công bố.</p><Link className="project-action" href="/projects">Back to projects</Link></div>;
}

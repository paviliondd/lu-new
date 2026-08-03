export const projectCategories = [
  "AWS",
  "DevOps",
  "Linux",
  "Kubernetes",
  "Observability",
] as const;

export const projectTypes = ["Personal Project", "Lab", "Open Source"] as const;
export const projectStatuses = ["completed", "in-progress", "archived"] as const;
export const implementationPhases = [
  "Design",
  "Provision",
  "Build",
  "Secure",
  "Observe",
  "Optimize",
] as const;

export type ProjectCategory = (typeof projectCategories)[number];
export type ProjectType = (typeof projectTypes)[number];
export type ProjectStatus = (typeof projectStatuses)[number];
export type ImplementationPhase = (typeof implementationPhases)[number];

export type ProjectLink = { label: string; url: string };

export type Project = {
  slug: string;
  title: string;
  summary: string;
  description?: string;
  category: ProjectCategory;
  type: ProjectType;
  status: ProjectStatus;
  featured?: boolean;
  placeholder?: boolean;
  startDate: string;
  endDate?: string;
  displayDate: string;
  role: string;
  tags: string[];
  highlights: string[];
  metrics?: Array<{ label: string; value: string }>;
  repositoryUrl?: string;
  demoUrl?: string;
  articleUrl?: string;
  thumbnail?: string;
  architectureImage?: string;
  architectureAlt?: string;
  architectureCaption?: string;
  architectureComponents?: Array<{ name: string; description: string }>;
  problem: string;
  constraints?: string[];
  successCriteria?: string[];
  implementation: Array<{
    phase: ImplementationPhase;
    title: string;
    description: string;
    tools: string[];
    output: string;
    links?: ProjectLink[];
  }>;
  decisions?: Array<{ decision: string; choice: string; reason: string }>;
  security?: string[];
  observability?: string[];
  results: string[];
  challenges: Array<{ problem: string; solution: string; lesson: string }>; 
  gallery?: Array<{ src: string; alt: string; caption?: string }>;
};

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isSafeOptionalUrl(value: string | undefined, field: string, slug: string) {
  if (!value) return;
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error(`${field} must use http(s) for ${slug}`);
  }
}

export function validateProject(project: Project): Project {
  if (!slugPattern.test(project.slug)) throw new Error(`Invalid project slug: ${project.slug}`);
  if (!project.title.trim() || !project.summary.trim() || !project.problem.trim()) {
    throw new Error(`Project ${project.slug} is missing required text`);
  }
  if (!projectCategories.includes(project.category)) throw new Error(`Invalid category: ${project.slug}`);
  if (!projectTypes.includes(project.type)) throw new Error(`Invalid type: ${project.slug}`);
  if (!projectStatuses.includes(project.status)) throw new Error(`Invalid status: ${project.slug}`);
  if (Number.isNaN(Date.parse(project.startDate))) throw new Error(`Invalid startDate: ${project.slug}`);
  if (project.endDate && Number.isNaN(Date.parse(project.endDate))) throw new Error(`Invalid endDate: ${project.slug}`);
  if (!project.tags.length || project.highlights.length > 3) throw new Error(`Invalid card content: ${project.slug}`);
  if (!project.implementation.length || !project.results.length || !project.challenges.length) {
    throw new Error(`Project ${project.slug} is missing detail sections`);
  }
  for (const urlField of ["repositoryUrl", "demoUrl", "articleUrl"] as const) {
    isSafeOptionalUrl(project[urlField], urlField, project.slug);
  }
  return project;
}

export function validateProjects(input: Project[]) {
  const projects = input.map(validateProject);
  const slugs = new Set(projects.map(({ slug }) => slug));
  if (slugs.size !== projects.length) throw new Error("Project slugs must be unique");
  return projects;
}

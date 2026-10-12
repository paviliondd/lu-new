import type { MigrateUpArgs } from "@payloadcms/db-postgres";
import { projects } from "../content/projects/projects";

function payloadProjectData(project: (typeof projects)[number]) {
  return {
    publicationStatus: "published" as const,
    projectStatus: project.status,
    featured: project.featured || false,
    placeholder: project.placeholder || false,
    category: project.category,
    type: project.type,
    title: project.title,
    slug: project.slug,
    summary: project.summary,
    description: project.description,
    startDate: project.startDate,
    endDate: project.endDate,
    displayDate: project.displayDate,
    role: project.role,
    tags: project.tags.map((value) => ({ value })),
    highlights: project.highlights.map((value) => ({ value })),
    metrics: project.metrics,
    repositoryUrl: project.repositoryUrl,
    demoUrl: project.demoUrl,
    articleUrl: project.articleUrl,
    architectureAlt: project.architectureAlt,
    architectureCaption: project.architectureCaption,
    architectureComponents: project.architectureComponents,
    problem: project.problem,
    constraints: project.constraints?.map((value) => ({ value })),
    successCriteria: project.successCriteria?.map((value) => ({ value })),
    implementation: project.implementation.map((item) => ({
      phase: item.phase,
      title: item.title,
      description: item.description,
      tools: item.tools.join(", "),
      output: item.output,
      linkLabel: item.links?.[0]?.label,
      linkUrl: item.links?.[0]?.url,
    })),
    decisions: project.decisions,
    security: project.security?.map((value) => ({ value })),
    observability: project.observability?.map((value) => ({ value })),
    results: project.results.map((value) => ({ value })),
    challenges: project.challenges,
  };
}

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const existing = await payload.find({
    collection: "projects",
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    req,
  });

  for (const project of existing.docs) {
    await payload.delete({
      collection: "projects",
      id: project.id,
      overrideAccess: true,
      req,
    });
  }

  for (const project of projects) {
    await payload.create({
      collection: "projects",
      overrideAccess: true,
      req,
      data: payloadProjectData(project),
    });
  }

  const imported = await payload.find({
    collection: "projects",
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    req,
    where: { publicationStatus: { equals: "published" } },
  });
  const importedSlugs = new Set(imported.docs.map((project) => String(project.slug)));
  const expectedSlugs = new Set(projects.map((project) => project.slug));

  if (imported.docs.length !== projects.length || importedSlugs.size !== expectedSlugs.size || [...expectedSlugs].some((slug) => !importedSlugs.has(slug))) {
    throw new Error(`Project replacement verification failed: expected ${projects.length} published projects.`);
  }
}

export async function down(): Promise<void> {
  // Preserve the imported CMS records on rollback; the pre-deploy backup is the recovery point.
}

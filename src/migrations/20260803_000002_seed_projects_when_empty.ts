import type { MigrateUpArgs } from "@payloadcms/db-postgres";
import { projects } from "../content/projects/projects";

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const existing = await payload.count({ collection: "projects", overrideAccess: true, req });

  // Bootstrap the new collection once, but never merge fallback content into a CMS
  // that already contains records. Payload remains authoritative after this migration.
  if (existing.totalDocs > 0) return;

  for (const project of projects) {
    await payload.create({
      collection: "projects",
      overrideAccess: true,
      req,
      data: {
        publicationStatus: "published",
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
      },
    });
  }
}

export async function down(): Promise<void> {
  // Intentionally preserve CMS content. Rolling back application code must not
  // delete project records that editors may have changed after the bootstrap.
}

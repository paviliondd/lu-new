import config from "@payload-config";
import { getPayload } from "payload";
import { projects } from "../src/content/projects/projects.ts";

const payload = await getPayload({ config });

for (const project of projects) {
  const existing = await payload.find({
    collection: "projects",
    limit: 1,
    overrideAccess: true,
    where: { slug: { equals: project.slug } },
  });

  if (existing.totalDocs) {
    console.log(`Skip existing project: ${project.slug}`);
    continue;
  }

  await payload.create({
    collection: "projects",
    overrideAccess: true,
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
  console.log(`Created project: ${project.slug}`);
}

console.log("Payload project seed complete.");
process.exit(0);

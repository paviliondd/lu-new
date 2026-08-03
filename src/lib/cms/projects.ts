import "server-only";

import config from "@payload-config";
import { getPayload, type Where } from "payload";
import { preferredMediaURL } from "@/lib/cms/media-url";
import { projects as fallbackProjects } from "@/content/projects/projects";
import { validateProject, type Project } from "@/content/projects/schema";

type PayloadDoc = Record<string, unknown>;

function canUsePayload() {
  return Boolean(process.env.DATABASE_URL && process.env.PAYLOAD_SECRET);
}

async function payloadClient() {
  if (!canUsePayload()) return null;
  try {
    return await getPayload({ config });
  } catch (error) {
    console.error("Unable to initialize Payload projects", { error });
    return null;
  }
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function arrayDocs(value: unknown): PayloadDoc[] {
  return Array.isArray(value) ? value.filter((item): item is PayloadDoc => Boolean(item && typeof item === "object")) : [];
}

function values(value: unknown) {
  return arrayDocs(value).map((item) => text(item.value)).filter(Boolean);
}

function media(value: unknown) {
  return preferredMediaURL(value) || undefined;
}

function mapPayloadProject(doc: PayloadDoc): Project {
  const implementation = arrayDocs(doc.implementation).map((item) => {
    const linkUrl = text(item.linkUrl);
    const linkLabel = text(item.linkLabel);
    return {
      phase: text(item.phase, "Design") as Project["implementation"][number]["phase"],
      title: text(item.title),
      description: text(item.description),
      tools: text(item.tools).split(",").map((tool) => tool.trim()).filter(Boolean),
      output: text(item.output),
      links: linkUrl && linkLabel ? [{ label: linkLabel, url: linkUrl }] : undefined,
    };
  });

  return validateProject({
    slug: text(doc.slug),
    title: text(doc.title),
    summary: text(doc.summary),
    description: text(doc.description) || undefined,
    category: text(doc.category, "AWS") as Project["category"],
    type: text(doc.type, "Lab") as Project["type"],
    status: text(doc.projectStatus, "in-progress") as Project["status"],
    featured: Boolean(doc.featured),
    placeholder: Boolean(doc.placeholder),
    startDate: text(doc.startDate),
    endDate: text(doc.endDate) || undefined,
    displayDate: text(doc.displayDate),
    role: text(doc.role),
    tags: values(doc.tags),
    highlights: values(doc.highlights),
    metrics: arrayDocs(doc.metrics).map((item) => ({ label: text(item.label), value: text(item.value) })).filter((item) => item.label && item.value),
    repositoryUrl: text(doc.repositoryUrl) || undefined,
    demoUrl: text(doc.demoUrl) || undefined,
    articleUrl: text(doc.articleUrl) || undefined,
    thumbnail: media(doc.thumbnail),
    architectureImage: media(doc.architectureImage),
    architectureAlt: text(doc.architectureAlt) || undefined,
    architectureCaption: text(doc.architectureCaption) || undefined,
    architectureComponents: arrayDocs(doc.architectureComponents).map((item) => ({ name: text(item.name), description: text(item.description) })),
    problem: text(doc.problem),
    constraints: values(doc.constraints),
    successCriteria: values(doc.successCriteria),
    implementation,
    decisions: arrayDocs(doc.decisions).map((item) => ({ decision: text(item.decision), choice: text(item.choice), reason: text(item.reason) })),
    security: values(doc.security),
    observability: values(doc.observability),
    results: values(doc.results),
    challenges: arrayDocs(doc.challenges).map((item) => ({ problem: text(item.problem), solution: text(item.solution), lesson: text(item.lesson) })),
    gallery: arrayDocs(doc.gallery).flatMap((item) => {
      const src = media(item.image);
      return src ? [{ src, alt: text(item.alt), caption: text(item.caption) || undefined }] : [];
    }),
  });
}

export async function getCmsProjects(): Promise<Project[]> {
  const payload = await payloadClient();
  if (!payload) return fallbackProjects;

  try {
    const result = await payload.find({ collection: "projects", depth: 1, limit: 100, sort: "-startDate", overrideAccess: true, where: { publicationStatus: { equals: "published" } } });
    return result.docs.flatMap((doc) => {
      try { return [mapPayloadProject(doc as unknown as PayloadDoc)]; }
      catch (error) { console.error("Skipping invalid published Payload project", { id: doc.id, error }); return []; }
    });
  } catch (error) {
    console.error("Unable to fetch Payload projects", { error });
    return fallbackProjects;
  }
}

export async function getCmsProject(slug: string): Promise<Project | null> {
  const payload = await payloadClient();
  if (!payload) return fallbackProjects.find((project) => project.slug === slug) || null;

  try {
    const conditions: Where[] = [{ slug: { equals: slug } }, { publicationStatus: { equals: "published" } }];
    const result = await payload.find({ collection: "projects", depth: 1, limit: 1, overrideAccess: true, where: { and: conditions } });
    return result.docs[0] ? mapPayloadProject(result.docs[0] as unknown as PayloadDoc) : null;
  } catch (error) {
    console.error("Unable to resolve Payload project", { slug, error });
    return fallbackProjects.find((project) => project.slug === slug) || null;
  }
}

import { APIError, type CollectionConfig } from "payload";

const publicProjectRead = ({ req: { user } }: { req: { user?: unknown } }) =>
  user ? true : { publicationStatus: { equals: "published" } };
const authenticated = ({ req: { user } }: { req: { user?: unknown } }) => Boolean(user);

function slugifyProject(value: string) {
  return value
    .toLowerCase()
    .replace(/\u0111/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const valueArray = (name: string, label: string, maxRows?: number) => ({
  name,
  label,
  type: "array" as const,
  maxRows,
  fields: [{ name: "value", type: "text" as const, required: true }],
});

const urlField = (name: string, label: string) => ({
  name,
  label,
  type: "text" as const,
  validate: (value: unknown) => {
    if (!value) return true;
    try {
      const url = new URL(String(value));
      return ["http:", "https:"].includes(url.protocol) || "URL must use HTTP or HTTPS.";
    } catch {
      return "Enter a valid URL.";
    }
  },
});

export const Projects: CollectionConfig = {
  slug: "projects",
  labels: { singular: "Project", plural: "Projects" },
  admin: {
    group: "Project Portfolio",
    useAsTitle: "title",
    defaultColumns: ["title", "category", "projectStatus", "publicationStatus", "startDate"],
    preview: (data) => {
      const site = (process.env.PROJECT_SITE_URL || "https://project.linuxunity.com").replace(/\/$/, "");
      return data?.slug ? `${site}/projects/${data.slug}` : site;
    },
    livePreview: {
      url: ({ data }) => {
        const site = (process.env.PROJECT_SITE_URL || "https://project.linuxunity.com").replace(/\/$/, "");
        return data?.slug ? `${site}/projects/${data.slug}` : site;
      },
    },
  },
  access: {
    read: publicProjectRead,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data && !data.slug && data.title) data.slug = slugifyProject(String(data.title));
        return data;
      },
    ],
    beforeChange: [
      ({ data }) => {
        if (!data || data.publicationStatus !== "published") return data;
        const requiredText = ["title", "summary", "startDate", "displayDate", "role", "problem"];
        const missing = requiredText.filter((field) => typeof data[field] !== "string" || !data[field].trim());
        if (missing.length) throw new APIError(`Published projects require: ${missing.join(", ")}.`, 400, null, true);
        if (!Array.isArray(data.implementation) || !data.implementation.length) {
          throw new APIError("Published projects require at least one implementation phase.", 400, null, true);
        }
        if (!Array.isArray(data.results) || !data.results.length || !Array.isArray(data.challenges) || !data.challenges.length) {
          throw new APIError("Published projects require results and challenges.", 400, null, true);
        }
        if (!data.publishedAt) data.publishedAt = new Date().toISOString();
        return data;
      },
    ],
  },
  fields: [
    { name: "publicationStatus", type: "select", required: true, defaultValue: "draft", options: [{ label: "Draft", value: "draft" }, { label: "Published", value: "published" }], admin: { position: "sidebar" } },
    { name: "projectStatus", label: "Project status", type: "select", required: true, defaultValue: "in-progress", options: [{ label: "Completed", value: "completed" }, { label: "In progress", value: "in-progress" }, { label: "Archived", value: "archived" }], admin: { position: "sidebar" } },
    { name: "featured", type: "checkbox", defaultValue: false, admin: { position: "sidebar" } },
    { name: "placeholder", type: "checkbox", defaultValue: false, admin: { position: "sidebar", description: "Clearly marks incomplete sample content on the public site." } },
    { name: "publishedAt", type: "date", admin: { position: "sidebar", date: { pickerAppearance: "dayAndTime" } } },
    { name: "category", type: "select", required: true, options: ["AWS", "DevOps", "Linux", "Kubernetes", "Observability"], admin: { position: "sidebar" } },
    { name: "type", type: "select", required: true, options: ["Personal Project", "Lab", "Open Source"], admin: { position: "sidebar" } },
    {
      type: "tabs",
      tabs: [
        {
          label: "Overview",
          fields: [
            { name: "title", type: "text", required: true },
            { name: "slug", type: "text", required: true, unique: true, index: true, admin: { description: "Generated from title when left blank." } },
            { name: "summary", type: "textarea", required: true, maxLength: 320 },
            { name: "description", type: "textarea" },
            { name: "startDate", type: "date", required: true },
            { name: "endDate", type: "date" },
            { name: "displayDate", type: "text", required: true, admin: { description: "Example: Tháng 7, 2026" } },
            { name: "role", type: "text", required: true },
            valueArray("tags", "Technology tags"),
            valueArray("highlights", "Card highlights", 3),
            { name: "metrics", type: "array", maxRows: 3, fields: [{ name: "label", type: "text", required: true }, { name: "value", type: "text", required: true }] },
          ],
        },
        {
          label: "Links & Media",
          fields: [
            urlField("repositoryUrl", "Repository URL"),
            urlField("demoUrl", "Live demo URL"),
            urlField("articleUrl", "Related article URL"),
            { name: "thumbnail", type: "relationship", relationTo: "media" },
            { name: "architectureImage", type: "relationship", relationTo: "media" },
            { name: "architectureAlt", type: "textarea" },
            { name: "architectureCaption", type: "text" },
            { name: "architectureComponents", type: "array", fields: [{ name: "name", type: "text", required: true }, { name: "description", type: "textarea", required: true }] },
            { name: "gallery", type: "array", fields: [{ name: "image", type: "relationship", relationTo: "media", required: true }, { name: "alt", type: "text", required: true }, { name: "caption", type: "text" }] },
          ],
        },
        {
          label: "Case Study",
          fields: [
            { name: "problem", type: "textarea", required: true },
            valueArray("constraints", "Constraints"),
            valueArray("successCriteria", "Success criteria"),
            {
              name: "implementation",
              type: "array",
              required: true,
              fields: [
                { name: "phase", type: "select", required: true, options: ["Design", "Provision", "Build", "Secure", "Observe", "Optimize"] },
                { name: "title", type: "text", required: true },
                { name: "description", type: "textarea", required: true },
                { name: "tools", type: "text", admin: { description: "Separate tools with commas." } },
                { name: "output", type: "text", required: true },
                { name: "linkLabel", type: "text" },
                urlField("linkUrl", "Code/file URL"),
              ],
            },
            { name: "decisions", type: "array", fields: [{ name: "decision", type: "text", required: true }, { name: "choice", type: "text", required: true }, { name: "reason", type: "textarea", required: true }] },
            valueArray("security", "Security controls"),
            valueArray("observability", "Observability"),
            valueArray("results", "Results"),
            { name: "challenges", type: "array", required: true, fields: [{ name: "problem", type: "textarea", required: true }, { name: "solution", type: "textarea", required: true }, { name: "lesson", type: "textarea", required: true }] },
          ],
        },
      ],
    },
  ],
};

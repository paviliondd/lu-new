import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { buildConfig, type CollectionConfig } from "payload";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const publicRead = () => true;
const authenticated = ({ req: { user } }: { req: { user?: unknown } }) => Boolean(user);
const publishedOrAuthenticated = ({ req: { user } }: { req: { user?: unknown } }) =>
  user
    ? true
    : {
        status: {
          equals: "published",
        },
      };

const listField = (name: string, label: string) => ({
  name,
  label,
  type: "array" as const,
  fields: [
    {
      name: "value",
      type: "text" as const,
      required: true,
    },
  ],
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function wordCount(value: unknown) {
  if (typeof value !== "string") return 0;
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function readTimeLabel(value: unknown, locale: "vi" | "en") {
  const minutes = Math.max(1, Math.ceil(wordCount(value) / 220));
  return locale === "vi" ? `${minutes} phut doc` : `${minutes} min read`;
}

function isPublished(data: unknown) {
  return Boolean(data && typeof data === "object" && "status" in data && data.status === "published");
}

const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email",
  },
  access: {
    read: authenticated,
  },
  fields: [
    {
      name: "name",
      type: "text",
    },
    {
      name: "provider",
      type: "select",
      options: [
        { label: "GitHub", value: "github" },
        { label: "Google", value: "google" },
      ],
      admin: { position: "sidebar" },
    },
    { name: "providerId", type: "text", admin: { position: "sidebar" } },
    { name: "avatarUrl", type: "text" },
  ],
};

const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: publicRead,
  },
  upload: {
    staticDir: path.resolve(dirname, "../public/uploads"),
    mimeTypes: ["image/*"],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
  ],
};

const Authors: CollectionConfig = {
  slug: "authors",
  admin: {
    useAsTitle: "name",
  },
  access: {
    read: publicRead,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data && !data.slug && data.name) data.slug = slugify(String(data.name));
        return data;
      },
    ],
  },
  fields: [
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "name", type: "text", required: true },
    { name: "roleVi", type: "text", label: "Role VI" },
    { name: "roleEn", type: "text", label: "Role EN" },
    { name: "descriptionVi", type: "textarea", label: "Description VI" },
    { name: "descriptionEn", type: "textarea", label: "Description EN" },
    { name: "avatar", type: "relationship", relationTo: "media" },
    { name: "linkedin", type: "text" },
    { name: "github", type: "text" },
  ],
};

const Series: CollectionConfig = {
  slug: "series",
  admin: {
    useAsTitle: "titleVi",
    defaultColumns: ["titleVi", "slug", "tag", "updatedAt"],
  },
  access: {
    read: publicRead,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data && !data.slug && data.titleVi) data.slug = slugify(String(data.titleVi));
        return data;
      },
    ],
  },
  fields: [
    {
      type: "collapsible",
      label: "Basic Information",
      fields: [
        { name: "titleVi", type: "text", label: "Title VI", required: true },
        { name: "titleEn", type: "text", label: "Title EN" },
        {
          name: "slug",
          type: "text",
          required: true,
          unique: true,
          index: true,
          admin: {
            description: "Generated from Title VI when left blank.",
          },
        },
        { name: "descriptionVi", type: "textarea", label: "Description VI" },
        { name: "descriptionEn", type: "textarea", label: "Description EN" },
      ],
    },
    {
      type: "collapsible",
      label: "Display",
      fields: [
        { name: "icon", type: "text", defaultValue: "layers" },
        { name: "tag", type: "text" },
        { name: "color", type: "text", defaultValue: "#2563eb" },
      ],
    },
  ],
};

const Posts: CollectionConfig = {
  slug: "posts",
  admin: {
    useAsTitle: "titleVi",
    defaultColumns: ["titleVi", "slug", "status", "publishedAt", "views"],
  },
  access: {
    read: publishedOrAuthenticated,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data && !data.slug && data.titleVi) data.slug = slugify(String(data.titleVi));
        return data;
      },
    ],
    beforeChange: [
      ({ data, originalDoc }) => {
        if (!data) return data;
        data.readTimeVi = readTimeLabel(data.contentVi, "vi");
        data.readTimeEn = readTimeLabel(data.contentEn || data.contentVi, "en");
        if (typeof data.views !== "number") data.views = Number(originalDoc?.views || 0);
        if (isPublished(data) && !data.publishedAt) data.publishedAt = new Date().toISOString();
        return data;
      },
    ],
  },
  fields: [
    {
      type: "collapsible",
      label: "Basic Information",
      fields: [
        { name: "titleVi", type: "text", label: "Title VI", required: true },
        { name: "titleEn", type: "text", label: "Title EN" },
        {
          name: "slug",
          type: "text",
          required: true,
          unique: true,
          index: true,
          admin: {
            description: "Generated from Title VI when left blank.",
          },
        },
        { name: "coverImage", type: "relationship", label: "Featured Image", relationTo: "media" },
        { name: "category", type: "text", defaultValue: "Cloud" },
        { name: "series", type: "relationship", relationTo: "series" },
        listField("tags", "Tags"),
      ],
    },
    {
      type: "collapsible",
      label: "Content",
      fields: [
        { name: "excerptVi", type: "textarea", label: "Excerpt VI" },
        { name: "excerptEn", type: "textarea", label: "Excerpt EN" },
        {
          name: "contentVi",
          type: "textarea",
          label: "Content VI",
          required: true,
          admin: {
            rows: 18,
            description: "HTML or Markdown. The frontend sanitizes before rendering.",
          },
        },
        {
          name: "contentEn",
          type: "textarea",
          label: "Content EN",
          admin: {
            rows: 18,
            description: "Leave blank to reuse Vietnamese content for English.",
          },
        },
      ],
    },
    {
      type: "collapsible",
      label: "SEO",
      fields: [
        {
          name: "seo",
          type: "group",
          fields: [
            { name: "titleVi", type: "text", label: "Meta title VI" },
            { name: "titleEn", type: "text", label: "Meta title EN" },
            { name: "descriptionVi", type: "textarea", label: "Meta description VI" },
            { name: "descriptionEn", type: "textarea", label: "Meta description EN" },
            { name: "ogImage", type: "relationship", label: "OG Image", relationTo: "media" },
          ],
        },
      ],
    },
    {
      type: "collapsible",
      label: "Publishing",
      fields: [
        {
          name: "status",
          type: "select",
          required: true,
          defaultValue: "draft",
          options: [
            { label: "Draft", value: "draft" },
            { label: "Published", value: "published" },
          ],
        },
        {
          name: "publishedAt",
          type: "date",
          admin: {
            date: { pickerAppearance: "dayAndTime" },
            description: "Generated on publish when left blank.",
          },
        },
        { name: "author", type: "relationship", relationTo: "authors" },
      ],
    },
    { name: "readTimeVi", type: "text", label: "Read time VI", admin: { readOnly: true, position: "sidebar" } },
    { name: "readTimeEn", type: "text", label: "Read time EN", admin: { readOnly: true, position: "sidebar" } },
    { name: "views", type: "number", defaultValue: 0, min: 0, admin: { readOnly: true, position: "sidebar" } },
    { name: "roadmapId", type: "number", admin: { hidden: true } },
    { name: "roadmapOrder", type: "number", admin: { hidden: true } },
    { name: "topicSlug", type: "text", admin: { hidden: true } },
    { name: "clusterSlug", type: "text", admin: { hidden: true } },
    { name: "gradient", type: "text", defaultValue: "from-slate-600/90 to-cyan-700/90", admin: { hidden: true } },
    listField("certs", "Certifications"),
    listField("services", "Services"),
    listField("examDomains", "Exam domains"),
    listField("labs", "Labs"),
    { name: "coverage", type: "text", admin: { hidden: true } },
    { name: "costNote", type: "textarea", admin: { hidden: true } },
    { name: "cleanupNote", type: "textarea", admin: { hidden: true } },
    { name: "editorialNote", type: "textarea", admin: { hidden: true } },
    { name: "quiz", type: "textarea", admin: { hidden: true } },
  ],
};

const Comments: CollectionConfig = {
  slug: "comments",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "post", "status", "createdAt"],
  },
  access: {
    read: ({ req: { user } }) =>
      user
        ? true
        : {
            status: {
              equals: "approved",
            },
          },
    create: () => true,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Approved", value: "approved" },
        { label: "Rejected", value: "rejected" },
      ],
    },
    { name: "name", type: "text", required: true },
    { name: "email", type: "email" },
    { name: "content", type: "textarea", required: true },
    { name: "post", type: "relationship", relationTo: "posts", required: true },
    { name: "user", type: "relationship", relationTo: "users" },
    { name: "parent", type: "relationship", relationTo: "comments" },
    {
      name: "provider",
      type: "select",
      options: [
        { label: "GitHub", value: "github" },
        { label: "Google", value: "google" },
      ],
    },
    { name: "providerUserId", type: "text" },
    { name: "username", type: "text" },
    { name: "avatarUrl", type: "text", admin: { hidden: true } },
    { name: "postSlug", type: "text", admin: { hidden: true } },
  ],
};

export default buildConfig({
  admin: {
    user: Users.slug,
  },
  collections: [Users, Media, Authors, Series, Posts, Comments],
  db: postgresAdapter({
    migrationDir: path.resolve(dirname, "migrations"),
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
    push: true,
  }),
  routes: {
    admin: "/admin",
    api: "/api/payload",
    graphQL: "/api/graphql",
    graphQLPlayground: "/api/graphql-playground",
  },
  secret: process.env.PAYLOAD_SECRET || "development-payload-secret-change-me",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});

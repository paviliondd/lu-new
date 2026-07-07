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
  fields: [
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "name", type: "text", required: true },
    { name: "roleVi", type: "text", label: "Role (VI)" },
    { name: "roleEn", type: "text", label: "Role (EN)" },
    { name: "descriptionVi", type: "textarea", label: "Description (VI)" },
    { name: "descriptionEn", type: "textarea", label: "Description (EN)" },
    { name: "avatar", type: "relationship", relationTo: "media" },
    { name: "linkedin", type: "text" },
    { name: "github", type: "text" },
  ],
};

const Series: CollectionConfig = {
  slug: "series",
  admin: {
    useAsTitle: "titleVi",
  },
  access: {
    read: publicRead,
  },
  fields: [
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "titleVi", type: "text", label: "Title (VI)", required: true },
    { name: "titleEn", type: "text", label: "Title (EN)" },
    { name: "descriptionVi", type: "textarea", label: "Description (VI)" },
    { name: "descriptionEn", type: "textarea", label: "Description (EN)" },
    { name: "icon", type: "text", defaultValue: "layers" },
    { name: "tag", type: "text" },
    { name: "color", type: "text", defaultValue: "#2563eb" },
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
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "publishedAt", type: "date", admin: { date: { pickerAppearance: "dayAndTime" } } },
    { name: "titleVi", type: "text", label: "Title (VI)", required: true },
    { name: "titleEn", type: "text", label: "Title (EN)" },
    { name: "excerptVi", type: "textarea", label: "Excerpt (VI)" },
    { name: "excerptEn", type: "textarea", label: "Excerpt (EN)" },
    {
      name: "contentVi",
      type: "textarea",
      label: "Content HTML/Markdown (VI)",
      required: true,
      admin: {
        rows: 18,
        description: "Có thể nhập HTML hoặc Markdown. Frontend sẽ tự render an toàn.",
      },
    },
    {
      name: "contentEn",
      type: "textarea",
      label: "Content HTML/Markdown (EN)",
      admin: {
        rows: 18,
        description: "Nếu để trống, trang /en sẽ dùng bản tiếng Việt.",
      },
    },
    { name: "coverImage", type: "relationship", relationTo: "media" },
    { name: "category", type: "text", defaultValue: "Cloud" },
    { name: "author", type: "relationship", relationTo: "authors" },
    { name: "series", type: "relationship", relationTo: "series" },
    { name: "readTimeVi", type: "text", label: "Read time (VI)" },
    { name: "readTimeEn", type: "text", label: "Read time (EN)" },
    { name: "views", type: "number", defaultValue: 0, min: 0 },
    { name: "roadmapId", type: "number" },
    { name: "roadmapOrder", type: "number" },
    { name: "topicSlug", type: "text" },
    { name: "clusterSlug", type: "text" },
    { name: "gradient", type: "text", defaultValue: "from-slate-600/90 to-cyan-700/90" },
    listField("tags", "Tags"),
    listField("certs", "Certifications"),
    listField("services", "Services"),
    listField("examDomains", "Exam domains"),
    listField("labs", "Labs"),
    { name: "coverage", type: "text" },
    { name: "costNote", type: "textarea" },
    { name: "cleanupNote", type: "textarea" },
    { name: "editorialNote", type: "textarea" },
    { name: "quiz", type: "textarea" },
    {
      name: "seo",
      type: "group",
      fields: [
        { name: "titleVi", type: "text", label: "SEO title (VI)" },
        { name: "titleEn", type: "text", label: "SEO title (EN)" },
        { name: "descriptionVi", type: "textarea", label: "SEO description (VI)" },
        { name: "descriptionEn", type: "textarea", label: "SEO description (EN)" },
        { name: "ogImage", type: "relationship", relationTo: "media" },
      ],
    },
  ],
};

export default buildConfig({
  admin: {
    user: Users.slug,
  },
  collections: [Users, Media, Authors, Series, Posts],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
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

import path from "node:path";
import { access, rename } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import type { SerializedEditorState, SerializedLexicalNode } from "lexical";
import { APIError, buildConfig, type Block, type CollectionConfig, type RichTextAdapterProvider } from "payload";
import sharp from "sharp";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const mediaDimensionsCache = new Map<string, { height: number; width: number }>();

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

const noteBlock: Block = {
  slug: "note",
  labels: {
    singular: "Note",
    plural: "Notes",
  },
  fields: [
    {
      name: "variant",
      type: "select",
      defaultValue: "note",
      options: [
        { label: "Note", value: "note" },
        { label: "Warning", value: "warning" },
        { label: "Tip", value: "tip" },
      ],
    },
    {
      name: "title",
      type: "text",
    },
    {
      name: "body",
      type: "textarea",
      required: true,
    },
  ],
};

const terminalBlock: Block = {
  slug: "terminal",
  labels: {
    singular: "Terminal",
    plural: "Terminal blocks",
  },
  fields: [
    { name: "title", type: "text", defaultValue: "Terminal" },
    { name: "commands", type: "textarea", required: true, admin: { rows: 8 } },
  ],
};

const fileTreeBlock: Block = {
  slug: "fileTree",
  labels: {
    singular: "File tree",
    plural: "File trees",
  },
  fields: [
    { name: "title", type: "text", defaultValue: "Project structure" },
    { name: "tree", type: "textarea", required: true, admin: { rows: 8 } },
  ],
};

const postEditor: RichTextAdapterProvider<
  SerializedEditorState<SerializedLexicalNode>,
  unknown,
  object
> = async (args) => {
  const {
    BlockquoteFeature,
    BlocksFeature,
    BoldFeature,
    CodeBlock,
    AlignFeature,
    EXPERIMENTAL_TableFeature,
    FixedToolbarFeature,
    HeadingFeature,
    HorizontalRuleFeature,
    InlineCodeFeature,
    InlineToolbarFeature,
    ItalicFeature,
    LinkFeature,
    OrderedListFeature,
    StrikethroughFeature,
    UnderlineFeature,
    UnorderedListFeature,
    UploadFeature,
    lexicalEditor,
  } = await import("@payloadcms/richtext-lexical");

  const codeBlock = CodeBlock({
    defaultLanguage: "bash",
    languages: {
      bash: "Bash",
      javascript: "JavaScript",
      typescript: "TypeScript",
      json: "JSON",
      yaml: "YAML",
      dockerfile: "Dockerfile",
      sql: "SQL",
      python: "Python",
      terraform: "Terraform",
      mermaid: "Mermaid",
    },
    fieldOverrides: {
      labels: {
        singular: "Code block",
        plural: "Code blocks",
      },
    },
  });
  codeBlock.fields.push({
    name: "explanation",
    type: "textarea",
    label: "Code explanation",
    admin: {
      description: "Optional explanation shown below the code block on the frontend.",
      rows: 6,
    },
  });

  return lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      FixedToolbarFeature(),
      InlineToolbarFeature(),
      HeadingFeature({ enabledHeadingSizes: ["h1", "h2", "h3", "h4", "h5", "h6"] }),
      BoldFeature(),
      ItalicFeature(),
      UnderlineFeature(),
      StrikethroughFeature(),
      InlineCodeFeature(),
      BlockquoteFeature(),
      HorizontalRuleFeature(),
      OrderedListFeature(),
      UnorderedListFeature(),
      LinkFeature(),
      UploadFeature({
        enabledCollections: ["media"],
        collections: {
          media: {
            fields: [
              { name: "caption", type: "text", label: "Caption" },
              { name: "alt", type: "text", label: "Alt text" },
              { name: "width", type: "number", label: "Display width (%)", min: 20, max: 100 },
            ],
          },
        },
      }),
      EXPERIMENTAL_TableFeature(),
      BlocksFeature({
        blocks: [
          codeBlock,
          terminalBlock,
          noteBlock,
          fileTreeBlock,
        ],
      }),
      AlignFeature(),
    ],
  })(args);
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/\u0111/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function mediaFileURL(filename: string) {
  return `/api/payload/media/file/${encodeURIComponent(filename)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function mediaAdminThumbnail({ doc }: { doc: Record<string, unknown> }) {
  if (typeof doc.url === "string" && doc.url) return doc.url;

  const sizes = isRecord(doc.sizes) ? doc.sizes : {};
  for (const sizeName of ["card", "article", "og"]) {
    const size = isRecord(sizes[sizeName]) ? sizes[sizeName] : null;
    if (typeof size?.url === "string" && size.url) return size.url;
    if (typeof size?.filename === "string" && size.filename) return mediaFileURL(size.filename);
  }

  if (typeof doc.filename === "string" && doc.filename) return mediaFileURL(doc.filename);

  return null;
}

function extensionFromFilename(value: unknown) {
  const extension = path.extname(typeof value === "string" ? value : "");
  return extension || "";
}

function mimeTypeFromFilename(value: string) {
  const extension = path.extname(value).toLowerCase();
  return ({
    ".avif": "image/avif",
    ".gif": "image/gif",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
  } as Record<string, string>)[extension] || "";
}

function normalizeLegacyMediaSizes(data: Record<string, unknown>) {
  if (!("sizes" in data)) return;
  if (!isRecord(data.sizes)) {
    delete data.sizes;
    return;
  }

  const normalizedSizes: Record<string, unknown> = {};
  for (const [sizeName, sizeValue] of Object.entries(data.sizes)) {
    if (!isRecord(sizeValue)) continue;
    const sizeFilename = typeof sizeValue.filename === "string" ? sizeValue.filename.trim() : "";
    if (!sizeFilename) continue;

    const inheritedMimeType = typeof data.mimeType === "string" ? data.mimeType : "";
    normalizedSizes[sizeName] = {
      ...sizeValue,
      filename: sizeFilename,
      mimeType:
        (typeof sizeValue.mimeType === "string" && sizeValue.mimeType) ||
        inheritedMimeType ||
        mimeTypeFromFilename(sizeFilename),
      url:
        (typeof sizeValue.url === "string" && sizeValue.url) ||
        mediaFileURL(sizeFilename),
    };
  }

  if (Object.keys(normalizedSizes).length > 0) data.sizes = normalizedSizes;
  else delete data.sizes;
}

async function fileExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function resolveMediaDiskFile(uploadDir: string, mediaFilename: string, urlHints: unknown[] = []) {
  const rootPath = path.join(uploadDir, mediaFilename);
  const importedPath = path.join(uploadDir, "imported", mediaFilename);
  const importedFirst = urlHints.some(
    (value) => typeof value === "string" && value.startsWith("/uploads/imported/")
  );
  const candidates = importedFirst
    ? [{ filePath: importedPath, imported: true }, { filePath: rootPath, imported: false }]
    : [{ filePath: rootPath, imported: false }, { filePath: importedPath, imported: true }];

  for (const candidate of candidates) {
    if (await fileExists(candidate.filePath)) return candidate;
  }

  throw new APIError(
    `Không tìm thấy tệp media "${mediaFilename}" trong uploads hoặc uploads/imported.`,
    404,
    null,
    true
  );
}

function mediaURLForStorage(nextFilename: string, imported: boolean) {
  return imported ? `/uploads/imported/${nextFilename}` : mediaFileURL(nextFilename);
}

async function hydrateLegacyMediaDocument(doc: Record<string, unknown>) {
  const mediaFilename = typeof doc.filename === "string" ? doc.filename : "";
  if (!mediaFilename) return doc;

  const uploadDir = path.resolve(dirname, "../public/uploads");
  const mediaFile = await resolveMediaDiskFile(uploadDir, mediaFilename, [
    doc.url,
    doc.thumbnailURL,
  ]);
  const mediaURL = mediaURLForStorage(mediaFilename, mediaFile.imported);
  const hydratedDoc: Record<string, unknown> = {
    ...doc,
    url: mediaURL,
    thumbnailURL: mediaURL,
  };

  const hasDimensions = Number(doc.width) > 0 && Number(doc.height) > 0;
  if (hasDimensions) return hydratedDoc;

  let dimensions = mediaDimensionsCache.get(mediaFile.filePath);
  if (!dimensions) {
    const metadata = await sharp(mediaFile.filePath).metadata();
    if (metadata.width && metadata.height) {
      dimensions = { width: metadata.width, height: metadata.height };
      mediaDimensionsCache.set(mediaFile.filePath, dimensions);
    }
  }

  return dimensions ? { ...hydratedDoc, ...dimensions } : hydratedDoc;
}

async function renameMediaFile(from: string, to: string) {
  if (from === to) return;
  if (await fileExists(to)) {
    throw new APIError(
      `Tệp media "${path.basename(to)}" đã tồn tại. Vui lòng chọn SEO filename khác.`,
      409,
      null,
      true
    );
  }

  try {
    await rename(from, to);
  } catch (error) {
    const reason = (error as NodeJS.ErrnoException).code || "storage error";
    throw new APIError(
      `Không thể đổi tên tệp media "${path.basename(from)}" (${reason}). Vui lòng kiểm tra quyền thư mục uploads.`,
      500,
      null,
      true
    );
  }
}

function wordCount(value: unknown) {
  if (typeof value !== "string") {
    return wordCount(textFromRichText(value));
  }
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function textFromRichText(value: unknown): string {
  if (!value || typeof value !== "object") return "";

  const node = value as { children?: unknown[]; root?: unknown; text?: unknown };
  const ownText = typeof node.text === "string" ? node.text : "";
  const rootText = textFromRichText(node.root);
  const childrenText = Array.isArray(node.children) ? node.children.map(textFromRichText).join(" ") : "";
  return [ownText, rootText, childrenText].filter(Boolean).join(" ");
}

function readTimeLabel(value: unknown, locale: "vi" | "en") {
  const minutes = Math.max(1, Math.ceil(wordCount(value) / 220));
  return locale === "vi" ? `${minutes} phút đọc` : `${minutes} min read`;
}

function isPublished(data: unknown) {
  return Boolean(data && typeof data === "object" && "status" in data && data.status === "published");
}

function validateLegacyContent(value: unknown) {
  if (value === undefined || value === null || typeof value === "string") return true;
  return "Legacy fallback content must be plain text or HTML.";
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
  admin: {
    useAsTitle: "alt",
    defaultColumns: ["alt", "filenameSlug", "filename", "updatedAt"],
  },
  upload: {
    staticDir: path.resolve(dirname, "../public/uploads"),
    adminThumbnail: mediaAdminThumbnail,
    displayPreview: true,
    crop: true,
    focalPoint: true,
    imageSizes: [
      {
        name: "card",
        width: 640,
        height: 400,
        position: "centre",
      },
      {
        name: "og",
        width: 1200,
        height: 630,
        position: "centre",
      },
      {
        name: "article",
        width: 1440,
        withoutEnlargement: true,
      },
    ],
    mimeTypes: ["image/*"],
  },
  hooks: {
    afterRead: [
      async ({ doc, findMany, req }) => {
        if (findMany || !isRecord(doc)) return doc;

        try {
          return await hydrateLegacyMediaDocument(doc);
        } catch (error) {
          req.payload.logger.warn(
            { id: doc.id, filename: doc.filename, error },
            "Unable to hydrate legacy media preview metadata",
          );
          return doc;
        }
      },
    ],
    beforeValidate: [
      ({ data }) => {
        if (!data) return data;
        normalizeLegacyMediaSizes(data);
        if (!data.filenameSlug && data.alt) data.filenameSlug = slugify(String(data.alt));
        if (data.filenameSlug) data.filenameSlug = slugify(String(data.filenameSlug));
        return data;
      },
    ],
    afterChange: [
      async ({ doc, operation, previousDoc, req }) => {
        if (req.context?.mediaRenameInProgress) return doc;
        if (!doc || typeof doc !== "object") return doc;

        const currentFilename = typeof doc.filename === "string" ? doc.filename : "";
        const desiredSlug = slugify(String(doc.filenameSlug || doc.alt || ""));
        const extension = extensionFromFilename(currentFilename || previousDoc?.filename);
        if (!desiredSlug || !extension || !currentFilename) return doc;

        const nextFilename = `${desiredSlug}${extension.toLowerCase()}`;
        if (currentFilename === nextFilename && doc.filenameSlug === desiredSlug) return doc;

        if (currentFilename !== nextFilename) {
          const existing = await req.payload.find({
            collection: "media",
            limit: 1,
            overrideAccess: true,
            where: {
              and: [
                { filename: { equals: nextFilename } },
                { id: { not_equals: doc.id } },
              ],
            },
          });

          if (existing.totalDocs > 0) {
            throw new APIError(
              `Tệp media "${nextFilename}" đã tồn tại. Vui lòng chọn SEO filename khác.`,
              409,
              null,
              true
            );
          }
        }

        const uploadDir = path.resolve(dirname, "../public/uploads");
        const renamedFiles: Array<{ from: string; to: string }> = [];
        try {
          const currentFile = await resolveMediaDiskFile(uploadDir, currentFilename, [
            doc.url,
            doc.thumbnailURL,
            previousDoc?.url,
            previousDoc?.thumbnailURL,
          ]);
          const nextPath = path.join(path.dirname(currentFile.filePath), nextFilename);
          await renameMediaFile(currentFile.filePath, nextPath);
          renamedFiles.push({ from: currentFile.filePath, to: nextPath });

          const nextSizes: Record<string, unknown> = {};
          if (isRecord(doc.sizes)) {
            for (const [sizeName, sizeValue] of Object.entries(doc.sizes)) {
              if (!isRecord(sizeValue)) continue;
              const sizeFilename = typeof sizeValue.filename === "string" ? sizeValue.filename : "";
              if (!sizeFilename) continue;

              const sizeExtension = extensionFromFilename(sizeFilename) || extension;
              const nextSizeFilename = `${desiredSlug}-${sizeName}${sizeExtension.toLowerCase()}`;
              const currentSizeFile = await resolveMediaDiskFile(uploadDir, sizeFilename, [
                sizeValue.url,
                doc.thumbnailURL,
              ]);
              const nextSizePath = path.join(path.dirname(currentSizeFile.filePath), nextSizeFilename);
              await renameMediaFile(currentSizeFile.filePath, nextSizePath);
              renamedFiles.push({ from: currentSizeFile.filePath, to: nextSizePath });
              nextSizes[sizeName] = {
                ...sizeValue,
                filename: nextSizeFilename,
                url: mediaURLForStorage(nextSizeFilename, currentSizeFile.imported),
              };
            }
          }

          const updateData: Record<string, unknown> = {
            filename: nextFilename,
            filenameSlug: desiredSlug,
            url: mediaURLForStorage(nextFilename, currentFile.imported),
          };
          if (Object.keys(nextSizes).length > 0) updateData.sizes = nextSizes;

          const normalizedDoc = await req.payload.update({
            collection: "media",
            id: doc.id,
            data: updateData,
            overrideAccess: true,
            req,
            context: {
              mediaRenameInProgress: true,
            },
          });

          req.payload.logger.info(
            { id: doc.id, operation, filename: nextFilename },
            "Media filename normalized"
          );
          return normalizedDoc;
        } catch (error) {
          for (const operation of renamedFiles.reverse()) {
            try {
              await rename(operation.to, operation.from);
            } catch (rollbackError) {
              req.payload.logger.error(
                { id: doc.id, operation, rollbackError },
                "Unable to roll back media filename after update failure"
              );
            }
          }
          req.payload.logger.error(
            { id: doc.id, filename: nextFilename, error },
            "Unable to persist normalized media filename"
          );
          throw error;
        }
      },
    ],
  },
  fields: [
    {
      name: "filenameSlug",
      type: "text",
      label: "SEO filename",
      admin: {
        description: "Lowercase filename without extension. Leave blank to generate from Alt.",
      },
      index: true,
      validate: (value: unknown) => {
        if (!value) return true;
        return /^[a-z0-9-]+$/.test(String(value))
          ? true
          : "Chỉ dùng chữ thường không dấu, số và dấu gạch ngang.";
      },
    },
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
      ({ data, req }) => {
        if (data && !data.slug && data.titleVi) data.slug = slugify(String(data.titleVi));
        for (const [field, value] of [
          ["contentVi", data?.contentVi],
          ["contentEn", data?.contentEn],
        ] as const) {
          if (typeof value === "string" && value.length > 40_000) {
            req.payload.logger.info(
              { field, length: value.length },
              "Allowing long legacy fallback content"
            );
          }
        }
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
    components: {
      beforeListTable: ["@/app/(payload)/components/BulkPublishPosts"],
    },
    preview: (data) => {
      const site = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
      return data?.slug ? `${site}/vi/blog/${data.slug}` : site;
    },
    livePreview: {
      url: ({ data }) => {
        const site = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
        return data?.slug ? `${site}/vi/blog/${data.slug}` : site;
      },
    },
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
        data.readTimeVi = readTimeLabel(data.contentRichVi || data.contentVi, "vi");
        data.readTimeEn = readTimeLabel(data.contentRichEn || data.contentEn || data.contentRichVi || data.contentVi, "en");
        if (typeof data.views !== "number") data.views = Number(originalDoc?.views || 0);
        if (isPublished(data) && !data.publishedAt) data.publishedAt = new Date().toISOString();
        return data;
      },
    ],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Post",
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
            { name: "excerptVi", type: "textarea", label: "Short Description VI" },
            { name: "excerptEn", type: "textarea", label: "Short Description EN" },
            {
              name: "contentRichVi",
              type: "richText",
              label: "Content Editor VI",
              editor: postEditor,
              admin: {
                description: "WordPress-style rich editor for new Vietnamese posts.",
              },
            },
            {
              name: "contentRichEn",
              type: "richText",
              label: "Content Editor EN",
              editor: postEditor,
              admin: {
                description: "Leave blank to reuse Vietnamese content for English.",
              },
            },
        { name: "category", type: "text", defaultValue: "Cloud" },
        { name: "series", type: "relationship", relationTo: "series" },
        listField("tags", "Tags"),
          ],
        },
        {
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
          label: "Publish",
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
        {
          label: "Advanced",
          fields: [
            {
              type: "collapsible",
              label: "Legacy content fallback",
              admin: {
                initCollapsed: true,
              },
              fields: [
                {
                  name: "contentVi",
                  type: "textarea",
                  label: "Legacy Content VI",
                  validate: validateLegacyContent,
                  admin: {
                    rows: 18,
                    description: "Optional Markdown/HTML fallback for migrated posts. Long articles are supported.",
                  },
                },
                {
                  name: "contentEn",
                  type: "textarea",
                  label: "Legacy Content EN",
                  validate: validateLegacyContent,
                  admin: {
                    rows: 18,
                    description: "Optional fallback only. Prefer Content Editor EN for new posts.",
                  },
                },
              ],
            },
            { name: "readTimeVi", type: "text", label: "Read time VI", admin: { readOnly: true } },
            { name: "readTimeEn", type: "text", label: "Read time EN", admin: { readOnly: true } },
            { name: "views", type: "number", defaultValue: 0, min: 0, admin: { readOnly: true } },
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
        },
      ],
    },
  ],
};

const Comments: CollectionConfig = {
  slug: "comments",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["content", "name", "email", "provider", "status", "createdAt"],
    listSearchableFields: ["name", "username", "email", "providerUserId", "content", "postSlug"],
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
    { name: "name", type: "text", required: true, admin: { description: "Display name from OAuth profile." } },
    { name: "email", type: "email", admin: { description: "Email from GitHub/Google OAuth when available." } },
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
    { name: "providerUserId", type: "text", admin: { position: "sidebar" } },
    { name: "username", type: "text", admin: { position: "sidebar" } },
    { name: "avatarUrl", type: "text", admin: { position: "sidebar" } },
    { name: "postSlug", type: "text", admin: { position: "sidebar" } },
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
  editor: postEditor,
  routes: {
    admin: "/admin",
    api: "/api/payload",
    graphQL: "/api/graphql",
    graphQLPlayground: "/api/graphql-playground",
  },
  secret: process.env.PAYLOAD_SECRET || "development-payload-secret-change-me",
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});

import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import config from "@payload-config";
import { getPayload } from "payload";

async function syncMdxPosts() {
  if (!process.env.DATABASE_URL || !process.env.PAYLOAD_SECRET) {
    console.warn("DATABASE_URL and PAYLOAD_SECRET are required to sync to Payload.");
    return;
  }

  const postsDirectory = path.join(process.cwd(), "content", "posts");
  let files = [];
  try {
    files = await fs.readdir(postsDirectory);
  } catch (error) {
    console.error("Failed to read content/posts directory:", error);
    return;
  }

  const payload = await getPayload({ config });

  const postGroups = new Map();

  for (const file of files) {
    if (!file.endsWith(".mdx")) continue;
    const match = file.match(/^(.+)\.(vi|en)\.mdx$/);
    if (!match) continue;

    const [, slug, locale] = match;
    if (!postGroups.has(slug)) {
      postGroups.set(slug, {});
    }

    const filePath = path.join(postsDirectory, file);
    const source = await fs.readFile(filePath, "utf8");
    const { data, content } = matter(source);

    postGroups.get(slug)[locale] = { data, content };
  }

  for (const [slug, entry] of postGroups.entries()) {
    const vi = entry.vi || entry.en;
    if (!vi) continue;
    const en = entry.en || entry.vi;

    const dataVi = vi.data || {};
    const dataEn = en.data || {};

    const titleVi = String(dataVi.title || slug);
    const titleEn = String(dataEn.title || dataVi.title_en || titleVi);
    const excerptVi = String(dataVi.description || "");
    const excerptEn = String(dataEn.description || dataVi.description_en || excerptVi);
    const contentVi = String(vi.content || "");
    const contentEn = String(en.content || contentVi);
    const category = String(dataVi.category || "DevOps");
    const tags = Array.isArray(dataVi.tags) ? dataVi.tags : [];
    const dateStr = dataVi.date ? String(dataVi.date) : new Date().toISOString();
    const publishedAt = new Date(dateStr).toISOString();

    const postPayloadData = {
      status: "published",
      slug,
      titleVi,
      titleEn,
      excerptVi,
      excerptEn,
      contentVi,
      contentEn,
      category,
      tags: tags.map((value) => ({ value: String(value) })),
      publishedAt,
      readTimeVi: String(dataVi.readTime || "5 min read"),
      readTimeEn: String(dataEn.readTime || dataVi.readTime_en || "5 min read"),
      seo: {
        titleVi: String(dataVi.seoTitle || titleVi),
        titleEn: String(dataEn.seoTitle || titleEn),
        descriptionVi: String(dataVi.seoDescription || excerptVi),
        descriptionEn: String(dataEn.seoDescription || excerptEn),
      },
    };

    const existing = await payload.find({
      collection: "posts",
      limit: 1,
      overrideAccess: true,
      where: { slug: { equals: slug } },
    });

    if (existing.docs[0]) {
      const existingDoc = existing.docs[0];
      const preserveStatus = existingDoc.status || "published";
      await payload.update({
        collection: "posts",
        id: existingDoc.id,
        overrideAccess: true,
        data: {
          ...postPayloadData,
          status: preserveStatus,
        },
      });
      console.log(`Updated Payload post: ${slug} (status preserved: ${preserveStatus})`);
    } else {
      await payload.create({
        collection: "posts",
        overrideAccess: true,
        data: postPayloadData,
      });
      console.log(`Created Payload post: ${slug}`);
    }
  }

  console.log("MDX posts Payload sync complete.");
  process.exit(0);
}

syncMdxPosts().catch((error) => {
  console.error("Error syncing MDX posts to Payload:", error);
  process.exit(1);
});

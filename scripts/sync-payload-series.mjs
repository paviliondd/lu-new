import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Client } = pg;
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const rootDir = path.resolve(dirname, "..");
const dataFile = path.join(rootDir, "src", "app", "data.ts");

function loadSeriesSeed() {
  const source = fs.readFileSync(dataFile, "utf8");
  const match = source.match(/export const series: Series\[] = (\[[\s\S]*?\n\]);/);
  if (!match) {
    throw new Error("Unable to find exported series array in src/app/data.ts");
  }

  return JSON.parse(match[1]);
}

function envConnectionString() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to sync Payload series.");
  }
  return connectionString;
}

async function upsertSeries(client, item) {
  await client.query(
    `
      INSERT INTO "series" (
        "slug",
        "title_vi",
        "title_en",
        "description_vi",
        "description_en",
        "icon",
        "tag",
        "color",
        "created_at",
        "updated_at"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now(), now())
      ON CONFLICT ("slug") DO UPDATE SET
        "title_vi" = EXCLUDED."title_vi",
        "title_en" = EXCLUDED."title_en",
        "description_vi" = EXCLUDED."description_vi",
        "description_en" = EXCLUDED."description_en",
        "icon" = EXCLUDED."icon",
        "tag" = EXCLUDED."tag",
        "color" = EXCLUDED."color",
        "updated_at" = now()
    `,
    [
      item.slug,
      item.title,
      item.title_en || item.title,
      item.description || "",
      item.description_en || item.description || "",
      item.icon || "layers",
      item.tag || "",
      item.color || "#2563eb",
    ]
  );
}

async function linkUnassignedPosts(client) {
  const result = await client.query(`
    UPDATE "posts" AS p
    SET
      "series_id" = s."id",
      "updated_at" = now()
    FROM "series" AS s
    WHERE
      p."series_id" IS NULL
      AND (
        p."cluster_slug" = s."slug"
        OR p."topic_slug" = s."slug"
      )
  `);

  return result.rowCount || 0;
}

async function main() {
  const seed = loadSeriesSeed();
  const client = new Client({ connectionString: envConnectionString() });

  await client.connect();
  try {
    await client.query("BEGIN");
    for (const item of seed) {
      await upsertSeries(client, item);
    }
    const linkedPosts = await linkUnassignedPosts(client);
    await client.query("COMMIT");
    console.log(`Synced ${seed.length} series into Payload CMS.`);
    console.log(`Linked ${linkedPosts} unassigned posts by cluster/topic slug.`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

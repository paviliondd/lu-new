import "server-only";

import { promises as fs } from "fs";
import path from "path";

const viewsFile = path.join(process.cwd(), "data", "views.json");

async function ensureStore() {
  await fs.mkdir(path.dirname(viewsFile), { recursive: true });
  try {
    await fs.access(viewsFile);
  } catch {
    await fs.writeFile(viewsFile, "{}\n", "utf8");
  }
}

export async function getLocalPostViews() {
  await ensureStore();
  const raw = await fs.readFile(viewsFile, "utf8");
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(parsed).map(([slug, value]) => [slug, Math.max(0, Number(value || 0))])
    );
  } catch {
    return {};
  }
}

export async function incrementLocalPostView(slug: string) {
  const views = await getLocalPostViews();
  const nextValue = Math.max(0, Number(views[slug] || 0)) + 1;
  views[slug] = nextValue;
  await fs.writeFile(viewsFile, `${JSON.stringify(views, null, 2)}\n`, "utf8");
  return nextValue;
}

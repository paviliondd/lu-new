import "server-only";

import { promises as fs } from "fs";
import path from "path";

const viewsFile = path.join(process.cwd(), "data", "views.json");
const sessionsFile = path.join(process.cwd(), "data", "view-sessions.json");
const viewWindowMs = 24 * 60 * 60 * 1000;

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

export async function getLocalPostView(slug: string) {
  const views = await getLocalPostViews();
  return Math.max(0, Number(views[slug] || 0));
}

export async function incrementLocalPostView(slug: string) {
  const views = await getLocalPostViews();
  const nextValue = Math.max(0, Number(views[slug] || 0)) + 1;
  views[slug] = nextValue;
  await fs.writeFile(viewsFile, `${JSON.stringify(views, null, 2)}\n`, "utf8");
  return nextValue;
}

async function getViewSessions() {
  await fs.mkdir(path.dirname(sessionsFile), { recursive: true });
  try {
    const raw = await fs.readFile(sessionsFile, "utf8");
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(parsed)
        .map(([key, value]) => [key, Number(value || 0)])
        .filter((entry): entry is [string, number] => Number.isFinite(entry[1]))
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("Unable to read view session store", { error });
    }
    return {};
  }
}

async function writeViewSessions(sessions: Record<string, number>) {
  await fs.mkdir(path.dirname(sessionsFile), { recursive: true });
  await fs.writeFile(sessionsFile, `${JSON.stringify(sessions, null, 2)}\n`, "utf8");
}

export async function hasRecentViewSession(sessionKey: string, now = Date.now()) {
  const sessions = await getViewSessions();
  const lastViewedAt = Number(sessions[sessionKey] || 0);
  return lastViewedAt > 0 && now - lastViewedAt < viewWindowMs;
}

export async function rememberViewSession(sessionKey: string, now = Date.now()) {
  const sessions = await getViewSessions();
  const cutoff = now - viewWindowMs;
  for (const [key, viewedAt] of Object.entries(sessions)) {
    if (viewedAt < cutoff) delete sessions[key];
  }
  sessions[sessionKey] = now;
  await writeViewSessions(sessions);
}

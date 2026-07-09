import "server-only";

import { promises as fs } from "fs";
import path from "path";
import { marked } from "marked";
import { FilterXSS } from "xss";
import type { CommentRecord } from "./types";

const commentsFile = path.join(process.cwd(), "data", "comments.json");
const commentFilter = new FilterXSS({
  whiteList: {
    a: ["href", "title", "target", "rel"],
    blockquote: [],
    br: [],
    code: [],
    em: [],
    li: [],
    ol: [],
    p: [],
    pre: [],
    strong: [],
    ul: [],
  },
  stripIgnoreTag: true,
  stripIgnoreTagBody: ["script", "style", "iframe", "object", "embed"],
});

async function ensureStore() {
  await fs.mkdir(path.dirname(commentsFile), { recursive: true });
  try {
    await fs.access(commentsFile);
  } catch {
    await fs.writeFile(commentsFile, "[]", "utf8");
  }
}

async function readAllComments() {
  await ensureStore();
  const raw = await fs.readFile(commentsFile, "utf8");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CommentRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeAllComments(comments: CommentRecord[]) {
  await ensureStore();
  await fs.writeFile(commentsFile, `${JSON.stringify(comments, null, 2)}\n`, "utf8");
}

export async function getComments(postSlug: string) {
  const comments = await readAllComments();
  return comments
    .filter((comment) => comment.postSlug === postSlug)
    .filter((comment) => !comment.status || comment.status === "approved")
    .sort((left, right) => +new Date(left.createdAt) - +new Date(right.createdAt));
}

export async function addComment(input: {
  postSlug: string;
  parentId?: string | null;
  name: string;
  avatarUrl?: string | null;
  body: string;
}) {
  const comments = await readAllComments();
  const body = input.body.trim().slice(0, 4000);
  const html = commentFilter.process(marked.parse(body, { async: false }) as string);
  const now = new Date().toISOString();
  const comment: CommentRecord = {
    id: crypto.randomUUID(),
    postSlug: input.postSlug,
    parentId: input.parentId || null,
    name: input.name.trim().slice(0, 80) || "LinuxUnity reader",
    avatarUrl: input.avatarUrl?.trim().slice(0, 400) || null,
    body,
    bodyHtml: html,
    status: "pending",
    createdAt: now,
  };

  comments.push(comment);
  await writeAllComments(comments);
  return comment;
}

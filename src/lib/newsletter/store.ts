import "server-only";

import { promises as fs } from "fs";
import path from "path";
import crypto from "node:crypto";

type NewsletterStatus = "pending" | "confirmed";

interface NewsletterSubscriber {
  id: string;
  email: string;
  status: NewsletterStatus;
  created_at: string;
  confirmed_at: string | null;
}

const subscribersFile = path.join(process.cwd(), "data", "newsletter_subscribers.json");

async function ensureStore() {
  try {
    await fs.mkdir(path.dirname(subscribersFile), { recursive: true });
    try {
      await fs.access(subscribersFile);
    } catch {
      await fs.writeFile(subscribersFile, "[]\n", "utf8");
    }
  } catch (error) {
    console.error("Failed to ensure newsletter subscriber store file", { subscribersFile, error });
  }
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export async function getNewsletterSubscribers() {
  await ensureStore();
  try {
    const content = await fs.readFile(subscribersFile, "utf8");
    const parsed = JSON.parse(content) as unknown;
    return Array.isArray(parsed) ? (parsed as NewsletterSubscriber[]) : [];
  } catch (error) {
    console.error("Failed to read newsletter subscribers file", { subscribersFile, error });
    return [];
  }
}

export async function addNewsletterSubscriber(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const subscribers = await getNewsletterSubscribers();
  const existing = subscribers.find((subscriber) => subscriber.email === normalizedEmail);

  if (existing) {
    return { subscriber: existing, created: false };
  }

  const now = new Date().toISOString();
  const subscriber: NewsletterSubscriber = {
    id: crypto.randomUUID(),
    email: normalizedEmail,
    status: "pending",
    created_at: now,
    confirmed_at: null,
  };

  subscribers.push(subscriber);
  try {
    await fs.writeFile(subscribersFile, `${JSON.stringify(subscribers, null, 2)}\n`, "utf8");
  } catch (error) {
    console.error("Failed to save newsletter subscriber to file", { subscribersFile, subscriber, error });
  }

  return { subscriber, created: true };
}

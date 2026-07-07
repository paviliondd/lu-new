import { NextResponse } from "next/server";
import {
  addNewsletterSubscriber,
  isValidEmail,
  normalizeEmail,
} from "@/lib/newsletter/store";
import {
  isSmtpConfigured,
  sendNewsletterConfirmation,
} from "@/lib/newsletter/smtp";
import { rateLimit } from "@/lib/server/rate-limit";

export async function POST(request: Request) {
  const limited = rateLimit(request, {
    key: "newsletter",
    limit: 8,
    windowMs: 60_000,
  });
  if (limited) return limited;

  const payload = (await request.json().catch(() => null)) as { email?: unknown } | null;
  const email = normalizeEmail(typeof payload?.email === "string" ? payload.email : "");

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const { subscriber, created } = await addNewsletterSubscriber(email);
  let confirmationSent = false;

  if (created && isSmtpConfigured()) {
    try {
      confirmationSent = await sendNewsletterConfirmation(subscriber.email);
    } catch (error) {
      console.error("Newsletter confirmation email failed", { email: subscriber.email, error });
    }
  }

  return NextResponse.json({
    subscriber: {
      id: subscriber.id,
      email: subscriber.email,
      status: subscriber.status,
      created_at: subscriber.created_at,
      confirmed_at: subscriber.confirmed_at,
    },
    created,
    confirmationSent,
  });
}

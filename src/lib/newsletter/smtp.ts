import "server-only";

import net from "node:net";
import tls from "node:tls";
import { getNewsletterSubscribers } from "./store";

interface SmtpConfig {
  host: string;
  port: number;
  user?: string;
  password?: string;
  from: string;
}

function smtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const from = process.env.SMTP_FROM?.trim();

  if (!host || !from || !Number.isFinite(port)) return null;

  return {
    host,
    port,
    user: process.env.SMTP_USER?.trim(),
    password: process.env.SMTP_PASSWORD?.trim(),
    from,
  };
}

function escapeAddress(value: string) {
  return value.replace(/[<>\r\n]/g, "").trim();
}

function messageBody(to: string, from: string) {
  const subject = "LinuxUnity newsletter subscription";
  const body = [
    "Thanks for subscribing to LinuxUnity DevOps newsletter.",
    "",
    "You will receive notifications when new posts or hands-on labs are published.",
  ].join("\n");

  return [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "",
    body,
  ].join("\r\n");
}

function readLine(socket: net.Socket) {
  return new Promise<string>((resolve, reject) => {
    let buffer = "";
    const timeout = windowlessTimeout(() => reject(new Error("SMTP read timeout")), 12_000);
    const onData = (chunk: Buffer) => {
      buffer += chunk.toString("utf8");
      const lines = buffer.split(/\r?\n/).filter(Boolean);
      const lastLine = lines[lines.length - 1];
      if (lastLine && /^\d{3}\s/.test(lastLine)) {
        cleanup();
        resolve(buffer);
      }
    };
    const onError = (error: Error) => {
      cleanup();
      reject(error);
    };
    const cleanup = () => {
      clearTimeout(timeout);
      socket.off("data", onData);
      socket.off("error", onError);
    };
    socket.on("data", onData);
    socket.on("error", onError);
  });
}

function windowlessTimeout(callback: () => void, delay: number) {
  return setTimeout(callback, delay);
}

async function command(socket: net.Socket, value: string, expected = /^[23]/) {
  socket.write(`${value}\r\n`);
  const response = await readLine(socket);
  if (!expected.test(response)) {
    throw new Error(`SMTP command failed: ${value}`);
  }
  return response;
}

function connect(config: SmtpConfig) {
  return new Promise<net.Socket>((resolve, reject) => {
    const socket =
      config.port === 465
        ? tls.connect(config.port, config.host, { servername: config.host })
        : net.connect(config.port, config.host);
    const timeout = setTimeout(() => reject(new Error("SMTP connect timeout")), 12_000);
    socket.once("connect", () => {
      clearTimeout(timeout);
      resolve(socket);
    });
    socket.once("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

async function startTls(socket: net.Socket, config: SmtpConfig) {
  await command(socket, "STARTTLS", /^220/);
  return tls.connect({
    socket,
    servername: config.host,
  });
}

export function isSmtpConfigured() {
  return Boolean(smtpConfig());
}

export async function sendRawEmail(to: string, subject: string, bodyText: string) {
  const config = smtpConfig();
  if (!config) return false;

  let socket = await connect(config);
  try {
    await readLine(socket);
    await command(socket, `EHLO ${config.host}`);

    if (config.port !== 465) {
      socket = await startTls(socket, config);
      await readLine(socket).catch(() => "");
      await command(socket, `EHLO ${config.host}`);
    }

    if (config.user && config.password) {
      await command(socket, "AUTH LOGIN", /^334/);
      await command(socket, Buffer.from(config.user).toString("base64"), /^334/);
      await command(socket, Buffer.from(config.password).toString("base64"), /^235/);
    }

    const from = escapeAddress(config.from);
    const recipient = escapeAddress(to);
    const message = [
      `From: ${from}`,
      `To: ${recipient}`,
      `Subject: ${subject}`,
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=UTF-8",
      "",
      bodyText,
    ].join("\r\n");

    await command(socket, `MAIL FROM:<${from}>`);
    await command(socket, `RCPT TO:<${recipient}>`);
    await command(socket, "DATA", /^354/);
    await command(socket, `${message}\r\n.`, /^250/);
    await command(socket, "QUIT", /^221/).catch(() => "");
    return true;
  } finally {
    socket.end();
  }
}

export async function sendNewsletterConfirmation(email: string) {
  return sendRawEmail(email, "LinuxUnity newsletter subscription", messageBody(email, smtpConfig()?.from || ""));
}

export async function broadcastNewPostNotification({
  title,
  slug,
  excerpt,
}: {
  title: string;
  slug: string;
  excerpt?: string;
}) {
  if (!isSmtpConfigured()) return { sent: 0, total: 0 };

  const subscribers = await getNewsletterSubscribers();
  if (!subscribers.length) return { sent: 0, total: 0 };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://linuxunity.com";
  const postUrl = `${siteUrl}/vi/blog/${slug}`;
  const subject = `[LinuxUnity] Bài viết mới: ${title}`;
  const bodyText = [
    "Xin chào,",
    "",
    `LinuxUnity vừa xuất bản bài viết mới: "${title}"`,
    excerpt ? `\nTóm tắt: ${excerpt}\n` : "",
    `Đọc bài viết chi tiết tại: ${postUrl}`,
    "",
    "Cảm ơn bạn đã đăng ký nhận tin từ LinuxUnity!",
  ].join("\n");

  let sentCount = 0;
  for (const subscriber of subscribers) {
    try {
      const success = await sendRawEmail(subscriber.email, subject, bodyText);
      if (success) sentCount++;
    } catch (err) {
      console.error(`Failed to send newsletter email to ${subscriber.email}`, err);
    }
  }

  return { sent: sentCount, total: subscribers.length };
}

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

export function getWelcomeEmailFrom() {
  return process.env.SMTP_FROM_WELCOME?.trim() || process.env.SMTP_FROM?.trim() || "welcome@linuxunity.com";
}

export function getNewsletterEmailFrom() {
  return process.env.SMTP_FROM_NEWSLETTER?.trim() || process.env.SMTP_FROM?.trim() || "newsletter@linuxunity.com";
}

export function getWelcomeHtmlTemplate() {
  const currentYear = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chào mừng bạn đến với LinuxUnity</title>
</head>
<body style="margin: 0; padding: 0; background-color: #090d16; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #090d16; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #0f172a; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);">
          <!-- Header Branding -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-bottom: 1px solid #1e293b;">
              <table role="presentation" width="100%">
                <tr>
                  <td style="vertical-align: middle;">
                    <div style="display: inline-block; vertical-align: middle; width: 44px; height: 44px; background-color: #ffffff; border-radius: 12px; text-align: center; line-height: 44px; margin-right: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
                      <img src="https://linuxunity.com/images/linuxunity-penguin-logo.png" alt="LinuxUnity Logo" width="32" height="32" style="vertical-align: middle; margin-top: 6px; border: 0;" />
                    </div>
                    <span style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; vertical-align: middle;">Linux<span style="color: #14b8a6;">Unity</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 32px; line-height: 1.65; font-size: 15px; color: #cbd5e1;">
              <h1 style="font-size: 22px; font-weight: 700; color: #ffffff; margin-top: 0; margin-bottom: 16px; letter-spacing: -0.3px;">
                Đăng ký nhận tin thành công! 🎉
              </h1>
              <p style="margin-top: 0; margin-bottom: 20px; color: #94a3b8;">
                Xin chào! Cảm ơn bạn đã đăng ký theo dõi <strong style="color: #2dd4bf;">LinuxUnity DevOps</strong>.
              </p>
              
              <div style="background-color: #1e293b; border-left: 4px solid #0d9488; border-radius: 8px; padding: 18px 20px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 14px; color: #e2e8f0; line-height: 1.6;">
                  Chúng mình sẽ định kỳ cập nhật và thông báo tới bạn những bài viết hướng dẫn chuyên sâu, kiến thức thực tế về <strong>Linux, DevOps, Cloud Architecture, Docker & Kubernetes</strong>.
                </p>
              </div>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin-top: 28px; margin-bottom: 12px;">
                <tr>
                  <td style="border-radius: 8px; background: linear-gradient(135deg, #0d9488 0%, #059669 100%); text-align: center;">
                    <a href="https://linuxunity.com/vi/blog" target="_blank" style="background: linear-gradient(135deg, #0d9488 0%, #059669 100%); border: 1px solid #14b8a6; font-family: inherit; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; display: inline-block;">
                      Khám phá bài viết ngay →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #0b0f19; border-top: 1px solid #1e293b; font-size: 12px; color: #64748b; line-height: 1.5;">
              <p style="margin: 0 0 4px 0;">© ${currentYear} LinuxUnity. Chia sẻ kiến thức Cloud & DevOps.</p>
              <p style="margin: 0;">Email này được gửi tự động từ <code>welcome@linuxunity.com</code>. Ghé thăm <a href="https://linuxunity.com" style="color: #2dd4bf; text-decoration: none;">linuxunity.com</a>.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function getNewPostHtmlTemplate({ title, slug, excerpt }: { title: string; slug: string; excerpt?: string }) {
  const currentYear = new Date().getFullYear();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://linuxunity.com";
  const postUrl = `${siteUrl}/vi/blog/${slug}`;

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #090d16; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #090d16; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #0f172a; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);">
          <!-- Header Branding -->
          <tr>
            <td style="padding: 24px 32px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-bottom: 1px solid #1e293b;">
              <table role="presentation" width="100%">
                <tr>
                  <td style="vertical-align: middle;">
                    <div style="display: inline-block; vertical-align: middle; width: 36px; height: 36px; background-color: #ffffff; border-radius: 10px; text-align: center; line-height: 36px; margin-right: 10px;">
                      <img src="https://linuxunity.com/images/linuxunity-penguin-logo.png" alt="LinuxUnity Logo" width="26" height="26" style="vertical-align: middle; margin-top: 5px; border: 0;" />
                    </div>
                    <span style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; vertical-align: middle;">Linux<span style="color: #14b8a6;">Unity</span> <span style="font-size: 12px; font-weight: 600; color: #0d9488; text-transform: uppercase; margin-left: 6px;">Newsletter</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 32px; line-height: 1.65; font-size: 15px; color: #cbd5e1;">
              <span style="display: inline-block; background-color: rgba(13, 148, 136, 0.15); color: #2dd4bf; border: 1px solid rgba(45, 212, 191, 0.3); font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; margin-bottom: 16px;">
                Bài viết mới xuất bản
              </span>
              <h1 style="font-size: 22px; font-weight: 700; color: #ffffff; margin-top: 0; margin-bottom: 16px; line-height: 1.35;">
                ${title}
              </h1>
              ${
                excerpt
                  ? `<p style="margin-top: 0; margin-bottom: 24px; color: #94a3b8; font-size: 15px; line-height: 1.6;">${excerpt}</p>`
                  : ""
              }
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin-top: 20px; margin-bottom: 12px;">
                <tr>
                  <td style="border-radius: 8px; background: linear-gradient(135deg, #0d9488 0%, #059669 100%); text-align: center;">
                    <a href="${postUrl}" target="_blank" style="background: linear-gradient(135deg, #0d9488 0%, #059669 100%); border: 1px solid #14b8a6; font-family: inherit; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; display: inline-block;">
                      Đọc bài viết chi tiết →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #0b0f19; border-top: 1px solid #1e293b; font-size: 12px; color: #64748b; line-height: 1.5;">
              <p style="margin: 0 0 4px 0;">© ${currentYear} LinuxUnity. Bạn nhận được email này vì đã đăng ký nhận tin từ LinuxUnity.</p>
              <p style="margin: 0;">Gửi từ <code>newsletter@linuxunity.com</code>.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendHtmlEmail({
  to,
  from,
  fromName = "LinuxUnity",
  subject,
  htmlContent,
}: {
  to: string;
  from?: string;
  fromName?: string;
  subject: string;
  htmlContent: string;
}) {
  const config = smtpConfig();
  if (!config) return false;

  const senderAddress = from || config.from;
  const cleanSender = escapeAddress(senderAddress);
  const cleanRecipient = escapeAddress(to);

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

    const encodedSubject = `=?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`;
    const fromHeader = `${fromName} <${cleanSender}>`;
    const base64Body = Buffer.from(htmlContent, "utf8").toString("base64");

    const messageLines = [
      `From: ${fromHeader}`,
      `To: ${cleanRecipient}`,
      `Subject: ${encodedSubject}`,
      "MIME-Version: 1.0",
      "Content-Type: text/html; charset=UTF-8",
      "Content-Transfer-Encoding: base64",
      "",
      base64Body,
    ];

    await command(socket, `MAIL FROM:<${cleanSender}>`);
    await command(socket, `RCPT TO:<${cleanRecipient}>`);
    await command(socket, "DATA", /^354/);
    await command(socket, `${messageLines.join("\r\n")}\r\n.`, /^250/);
    await command(socket, "QUIT", /^221/).catch(() => "");
    return true;
  } finally {
    socket.end();
  }
}

export async function sendNewsletterConfirmation(email: string) {
  return sendHtmlEmail({
    to: email,
    from: getWelcomeEmailFrom(),
    fromName: "LinuxUnity",
    subject: "Chào mừng bạn đến với LinuxUnity!",
    htmlContent: getWelcomeHtmlTemplate(),
  });
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

  const subject = `[LinuxUnity] Bài viết mới: ${title}`;
  const htmlContent = getNewPostHtmlTemplate({ title, slug, excerpt });
  const fromEmail = getNewsletterEmailFrom();

  let sentCount = 0;
  for (const subscriber of subscribers) {
    try {
      const success = await sendHtmlEmail({
        to: subscriber.email,
        from: fromEmail,
        fromName: "LinuxUnity Newsletter",
        subject,
        htmlContent,
      });
      if (success) sentCount++;
    } catch (err) {
      console.error(`Failed to send newsletter email to ${subscriber.email}`, err);
    }
  }

  return { sent: sentCount, total: subscribers.length };
}

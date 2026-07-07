import "server-only";

import net from "node:net";
import tls from "node:tls";

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

export async function sendNewsletterConfirmation(email: string) {
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
    const to = escapeAddress(email);
    await command(socket, `MAIL FROM:<${from}>`);
    await command(socket, `RCPT TO:<${to}>`);
    await command(socket, "DATA", /^354/);
    await command(socket, `${messageBody(to, from)}\r\n.`, /^250/);
    await command(socket, "QUIT", /^221/).catch(() => "");
    return true;
  } finally {
    socket.end();
  }
}

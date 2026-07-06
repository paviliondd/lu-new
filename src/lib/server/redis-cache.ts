import net from "node:net";
import tls from "node:tls";

type RedisValue = string | number;

const redisUrl = process.env.REDIS_URL || "";
const keyPrefix = process.env.REDIS_KEY_PREFIX || "linuxunity";

function isEnabled() {
  return Boolean(redisUrl);
}

function encodeCommand(command: RedisValue[]) {
  return `*${command.length}\r\n${command
    .map((part) => {
      const value = String(part);
      return `$${Buffer.byteLength(value)}\r\n${value}\r\n`;
    })
    .join("")}`;
}

function parseResp(buffer: Buffer): unknown[] {
  let offset = 0;

  const readLine = () => {
    const end = buffer.indexOf("\r\n", offset, "utf8");
    if (end === -1) throw new Error("Invalid Redis response");
    const line = buffer.toString("utf8", offset, end);
    offset = end + 2;
    return line;
  };

  const read = (): unknown => {
    const type = String.fromCharCode(buffer[offset++]);
    if (type === "+") return readLine();
    if (type === "-") throw new Error(readLine());
    if (type === ":") return Number(readLine());
    if (type === "$") {
      const length = Number(readLine());
      if (length < 0) return null;
      if (offset + length + 2 > buffer.length) throw new Error("Invalid Redis response");
      const value = buffer.toString("utf8", offset, offset + length);
      offset += length + 2;
      return value;
    }
    if (type === "*") {
      const length = Number(readLine());
      if (length < 0) return null;
      return Array.from({ length }, () => read());
    }
    throw new Error("Unsupported Redis response");
  };

  const responses: unknown[] = [];
  while (offset < buffer.length) {
    responses.push(read());
  }

  return responses;
}

async function redisCommand(command: RedisValue[]) {
  if (!isEnabled()) return null;

  return new Promise<unknown>((resolve, reject) => {
    const url = new URL(redisUrl);
    const port = Number(url.port || (url.protocol === "rediss:" ? 6380 : 6379));
    const socket =
      url.protocol === "rediss:"
        ? tls.connect({ host: url.hostname, port, servername: url.hostname })
        : net.connect({ host: url.hostname, port });
    const chunks: Buffer[] = [];
    let expectedResponses = 1;
    let settled = false;
    const timer = setTimeout(() => {
      socket.destroy(new Error("Redis timeout"));
    }, 1500);

    const finish = (value: unknown) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      socket.end();
      resolve(value);
    };

    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      socket.destroy();
      reject(error);
    };

    socket.on("connect", () => {
      const authCommands: RedisValue[][] = [];
      if (url.password) {
        authCommands.push(url.username ? ["AUTH", url.username, url.password] : ["AUTH", url.password]);
      }
      if (url.pathname.length > 1) {
        authCommands.push(["SELECT", url.pathname.slice(1)]);
      }
      expectedResponses = authCommands.length + 1;
      socket.write(authCommands.map(encodeCommand).join("") + encodeCommand(command));
    });

    socket.on("data", (chunk) => {
      chunks.push(chunk);
      try {
        const responses = parseResp(Buffer.concat(chunks));
        if (responses.length >= expectedResponses) {
          finish(responses[responses.length - 1] ?? null);
        }
      } catch (error) {
        if (error instanceof Error && error.message.startsWith("Invalid Redis response")) return;
        fail(error instanceof Error ? error : new Error("Redis parse failed"));
      }
    });
    socket.on("error", fail);
  });
}

function cacheKey(key: string) {
  return `${keyPrefix}:${key}`;
}

export async function getCachedJson<T>(key: string): Promise<T | null> {
  if (!isEnabled()) return null;

  try {
    const value = await redisCommand(["GET", cacheKey(key)]);
    if (typeof value !== "string") {
      console.info("Redis Miss", { key });
      return null;
    }
    console.info("Redis Hit", { key });
    return JSON.parse(value) as T;
  } catch (error) {
    console.error("Redis Error", { key, error });
    return null;
  }
}

export async function setCachedJson(key: string, value: unknown, ttlSeconds: number) {
  if (!isEnabled()) return;

  try {
    await redisCommand(["SET", cacheKey(key), JSON.stringify(value), "EX", ttlSeconds]);
  } catch (error) {
    console.error("Redis Error", { key, error });
  }
}

export async function cachedJson<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>
): Promise<T> {
  const cached = await getCachedJson<T>(key);
  if (cached) return cached;

  const value = await loader();
  await setCachedJson(key, value, ttlSeconds);
  return value;
}

export async function invalidateCache(patterns: string[]) {
  if (!isEnabled()) return;

  for (const pattern of patterns) {
    try {
      const keys = await redisCommand(["KEYS", cacheKey(pattern)]);
      if (Array.isArray(keys) && keys.length > 0) {
        await redisCommand(["DEL", ...keys.filter((key): key is string => typeof key === "string")]);
      }
    } catch (error) {
      console.error("Redis Error", { pattern, error });
    }
  }
}

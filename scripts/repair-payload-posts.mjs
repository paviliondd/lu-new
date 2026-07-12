import net from "node:net";
import tls from "node:tls";
import pg from "pg";

const { Client } = pg;

function connectionString() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required.");
  }
  return process.env.DATABASE_URL;
}

function wordCount(value = "") {
  return String(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function readTimeLabel(value = "", locale = "vi") {
  const minutes = Math.max(1, Math.ceil(wordCount(value) / 220));
  return locale === "vi" ? `${minutes} phút đọc` : `${minutes} min read`;
}

function encodeRedisCommand(command) {
  return `*${command.length}\r\n${command
    .map((part) => {
      const value = String(part);
      return `$${Buffer.byteLength(value)}\r\n${value}\r\n`;
    })
    .join("")}`;
}

function parseRedis(buffer) {
  let offset = 0;

  const readLine = () => {
    const end = buffer.indexOf("\r\n", offset, "utf8");
    if (end === -1) throw new Error("Invalid Redis response");
    const line = buffer.toString("utf8", offset, end);
    offset = end + 2;
    return line;
  };

  const read = () => {
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

  const responses = [];
  while (offset < buffer.length) responses.push(read());
  return responses;
}

async function redisCommand(command) {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) return null;

  return new Promise((resolve, reject) => {
    const url = new URL(redisUrl);
    const port = Number(url.port || (url.protocol === "rediss:" ? 6380 : 6379));
    const socket =
      url.protocol === "rediss:"
        ? tls.connect({ host: url.hostname, port, servername: url.hostname })
        : net.connect({ host: url.hostname, port });
    const chunks = [];
    let expectedResponses = 1;
    let settled = false;
    const timer = setTimeout(() => socket.destroy(new Error("Redis timeout")), 1500);

    const finish = (value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      socket.end();
      resolve(value);
    };

    const fail = (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      socket.destroy();
      reject(error);
    };

    socket.on("connect", () => {
      const authCommands = [];
      if (url.password) {
        authCommands.push(url.username ? ["AUTH", url.username, url.password] : ["AUTH", url.password]);
      }
      if (url.pathname.length > 1) authCommands.push(["SELECT", url.pathname.slice(1)]);
      expectedResponses = authCommands.length + 1;
      socket.write(authCommands.map(encodeRedisCommand).join("") + encodeRedisCommand(command));
    });

    socket.on("data", (chunk) => {
      chunks.push(chunk);
      try {
        const responses = parseRedis(Buffer.concat(chunks));
        if (responses.length >= expectedResponses) finish(responses[responses.length - 1] ?? null);
      } catch (error) {
        if (error instanceof Error && error.message.startsWith("Invalid Redis response")) return;
        fail(error instanceof Error ? error : new Error("Redis parse failed"));
      }
    });
    socket.on("error", fail);
  });
}

async function clearRedisCache() {
  if (!process.env.REDIS_URL) return 0;

  const prefix = process.env.REDIS_KEY_PREFIX || "linuxunity";
  const patterns = [
    "posts:published:*",
    "posts:detail:*",
    "series:list:*",
    "search:*",
  ];
  let deleted = 0;

  for (const pattern of patterns) {
    const keys = await redisCommand(["KEYS", `${prefix}:${pattern}`]);
    if (!Array.isArray(keys) || keys.length === 0) continue;
    await redisCommand(["DEL", ...keys]);
    deleted += keys.length;
  }

  return deleted;
}

async function printStats(client, label) {
  const status = await client.query(`
    SELECT status, count(*)::int AS count
    FROM posts
    GROUP BY status
    ORDER BY status
  `);
  const content = await client.query(`
    SELECT
      count(*)::int AS total,
      count(*) FILTER (WHERE status = 'published')::int AS published,
      count(*) FILTER (WHERE coalesce(nullif(trim(content_vi), ''), nullif(trim(content_en), '')) IS NOT NULL)::int AS with_content,
      count(*) FILTER (WHERE status = 'published' AND coalesce(nullif(trim(content_vi), ''), nullif(trim(content_en), '')) IS NOT NULL)::int AS visible_with_content
    FROM posts
  `);

  console.log(`[${label}] status counts:`, status.rows);
  console.log(`[${label}] content counts:`, content.rows[0]);
}

async function repairPosts(client) {
  const result = await client.query(`
    SELECT id, content_vi, content_en
    FROM posts
    WHERE
      status <> 'published'
      OR published_at IS NULL
      OR read_time_vi IS NULL
      OR read_time_en IS NULL
      OR read_time_vi = 'Draft'
      OR read_time_en = 'Draft'
  `);

  for (const row of result.rows) {
    const viContent = row.content_vi || row.content_en || "";
    const enContent = row.content_en || row.content_vi || "";
    await client.query(
      `
        UPDATE posts
        SET
          status = 'published',
          published_at = coalesce(published_at, created_at, now()),
          read_time_vi = $2,
          read_time_en = $3,
          updated_at = now()
        WHERE id = $1
      `,
      [row.id, readTimeLabel(viContent, "vi"), readTimeLabel(enContent, "en")]
    );
  }

  return result.rowCount || 0;
}

async function main() {
  const client = new Client({ connectionString: connectionString() });
  await client.connect();

  try {
    await printStats(client, "before");
    await client.query("BEGIN");
    const repaired = await repairPosts(client);
    await client.query("COMMIT");
    const deletedKeys = await clearRedisCache().catch((error) => {
      console.warn("Unable to clear Redis cache:", error instanceof Error ? error.message : String(error));
      return 0;
    });
    await printStats(client, "after");
    console.log(`Repaired ${repaired} posts.`);
    console.log(`Cleared ${deletedKeys} Redis cache keys.`);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

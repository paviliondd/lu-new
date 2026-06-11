import type { NextConfig } from "next";
import fs from "node:fs";
import path from "node:path";

const allowPrivateImageHosts = process.env.ALLOW_PRIVATE_IMAGE_HOSTS === "true";

function isPrivateIpv4(hostname: string) {
  const parts = hostname.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return false;
  }

  const [first, second] = parts;
  return (
    first === 10 ||
    first === 127 ||
    first === 0 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    (first === 169 && second === 254)
  );
}

function isPrivateImageHost(hostname: string) {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, "");

  return (
    normalized === "localhost" ||
    normalized === "wordpress" ||
    normalized === "::1" ||
    normalized.endsWith(".localhost") ||
    normalized.endsWith(".local") ||
    isPrivateIpv4(normalized)
  );
}

function configuredImageOrigins() {
  const manifestPath = path.join(process.cwd(), "content", "image-hosts.json");
  let manifestOrigins: string[] = [];

  if (fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      manifestOrigins = Array.isArray(manifest) ? manifest.map(String) : [];
    } catch {
      console.warn(`Ignoring invalid image host manifest: ${manifestPath}`);
    }
  }
  const environmentOrigins = [
    process.env.NEXT_PUBLIC_WORDPRESS_PUBLIC_URL,
    process.env.WORDPRESS_PUBLIC_URL,
    process.env.WORDPRESS_SITE_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    ...(process.env.IMAGE_REMOTE_HOSTS || "").split(","),
  ];

  return [...new Set([...manifestOrigins, ...environmentOrigins])]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value))
    .flatMap((value) => {
      try {
        const url = new URL(value);
        if (!allowPrivateImageHosts && isPrivateImageHost(url.hostname)) {
          console.warn(`Ignoring private image host in next.config.ts: ${url.hostname}`);
          return [];
        }

        return [
          {
            protocol: url.protocol.replace(":", "") as "http" | "https",
            hostname: url.hostname,
            port: url.port,
            pathname: "/wp-content/uploads/**",
          },
        ];
      } catch {
        return [];
      }
    });
}

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: configuredImageOrigins(),
  },
};

export default nextConfig;

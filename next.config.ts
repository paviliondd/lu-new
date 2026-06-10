import type { NextConfig } from "next";
import fs from "node:fs";
import path from "node:path";

function configuredImageOrigins() {
  const manifestPath = path.join(process.cwd(), "content", "image-hosts.json");
  const manifestOrigins = fs.existsSync(manifestPath)
    ? (JSON.parse(fs.readFileSync(manifestPath, "utf8")) as string[])
    : [];
  const environmentOrigins = [
    process.env.WORDPRESS_SITE_URL,
    process.env.WORDPRESS_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    ...(process.env.IMAGE_REMOTE_HOSTS || "").split(","),
  ];

  return [...new Set([...manifestOrigins, ...environmentOrigins])]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value))
    .flatMap((value) => {
      try {
        const url = new URL(value);
        return [
          {
            protocol: url.protocol.replace(":", "") as "http" | "https",
            hostname: url.hostname,
            port: url.port,
            pathname: "/**",
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

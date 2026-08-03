import { getCmsProjects } from "@/lib/cms/projects";

export const revalidate = 60;

export async function GET() {
  const projects = await getCmsProjects();
  const urls = ["", ...projects.map(({ slug }) => `/${slug}`)];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((path) => `\n  <url><loc>https://project.linuxunity.com${path || "/"}</loc></url>`).join("")}\n</urlset>`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}

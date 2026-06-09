import { getCmsPublishedPosts } from "@/lib/cms/wordpress";

export const dynamic = "force-dynamic";

export async function GET() {
  const posts = await getCmsPublishedPosts();
  return Response.json(posts);
}

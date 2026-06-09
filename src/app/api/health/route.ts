export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    ok: true,
    service: "cloud-devops-blog",
    timestamp: new Date().toISOString(),
  });
}

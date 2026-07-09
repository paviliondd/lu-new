import { NextResponse } from "next/server";
import { authorizationUrl } from "@/lib/auth/oauth";
import { createOAuthState, setOAuthReturnTo } from "@/lib/auth/session";

export async function GET(request: Request) {
  try {
    const response = NextResponse.redirect(new URL("/", request.url));
    const state = createOAuthState(response, "github");
    setOAuthReturnTo(response, "github", new URL(request.url).searchParams.get("returnTo"));
    response.headers.set("Location", authorizationUrl("github", state, request.url).toString());
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "GitHub OAuth is not configured" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { exchangeOAuthCode } from "@/lib/auth/oauth";
import {
  clearOAuthReturnTo,
  clearOAuthState,
  consumeOAuthReturnTo,
  consumeOAuthState,
  setSessionCookie,
} from "@/lib/auth/session";
import { upsertPayloadOAuthUser } from "@/lib/cms/payload";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const returnTo = await consumeOAuthReturnTo("github");
  const response = NextResponse.redirect(new URL(returnTo, request.url));

  try {
    if (!code || !(await consumeOAuthState("github", state))) {
      return NextResponse.json({ error: "Invalid GitHub OAuth callback" }, { status: 400 });
    }
    const profile = await exchangeOAuthCode("github", code, request.url);
    const user = await upsertPayloadOAuthUser(profile);
    setSessionCookie(response, user);
    clearOAuthState(response, "github");
    clearOAuthReturnTo(response, "github");
    return response;
  } catch (error) {
    clearOAuthState(response, "github");
    clearOAuthReturnTo(response, "github");
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "GitHub OAuth failed" },
      { status: 500 }
    );
  }
}

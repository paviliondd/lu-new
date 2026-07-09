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
  const returnTo = await consumeOAuthReturnTo("google");
  const response = NextResponse.redirect(new URL(returnTo, request.url));

  try {
    if (!code || !(await consumeOAuthState("google", state))) {
      clearOAuthState(response, "google");
      return NextResponse.json({ error: "Invalid Google OAuth callback" }, { status: 400 });
    }
    const profile = await exchangeOAuthCode("google", code, request.url);
    const user = await upsertPayloadOAuthUser(profile);
    setSessionCookie(response, user);
    clearOAuthState(response, "google");
    clearOAuthReturnTo(response, "google");
    return response;
  } catch (error) {
    clearOAuthState(response, "google");
    clearOAuthReturnTo(response, "google");
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Google OAuth failed" },
      { status: 500 }
    );
  }
}

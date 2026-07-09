import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

export type OAuthProvider = "github" | "google";

export interface AuthUser {
  userId?: string;
  provider: OAuthProvider;
  providerUserId: string;
  name: string;
  email: string;
  avatar: string | null;
}

const sessionCookie = "linuxunity_session";
const stateCookiePrefix = "linuxunity_oauth_state_";
const returnCookiePrefix = "linuxunity_oauth_return_";
const sessionMaxAge = 60 * 60 * 24 * 30;
const stateMaxAge = 60 * 10;

function secret() {
  return process.env.AUTH_SESSION_SECRET || process.env.PAYLOAD_SECRET || "development-auth-secret-change-me";
}

function base64Url(value: Buffer | string) {
  return Buffer.from(value).toString("base64url");
}

function sign(payload: string) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function encodeSession(user: AuthUser) {
  const payload = base64Url(
    JSON.stringify({
      ...user,
      exp: Math.floor(Date.now() / 1000) + sessionMaxAge,
    })
  );
  return `${payload}.${sign(payload)}`;
}

export function decodeSession(value: string | undefined): AuthUser | null {
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature || sign(payload) !== signature) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AuthUser & {
      exp?: number;
    };
    if (!parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) return null;
    return {
      userId: parsed.userId,
      provider: parsed.provider,
      providerUserId: parsed.providerUserId,
      name: parsed.name,
      email: parsed.email,
      avatar: parsed.avatar || null,
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const store = await cookies();
  return decodeSession(store.get(sessionCookie)?.value);
}

export function setSessionCookie(response: NextResponse, user: AuthUser) {
  response.cookies.set(sessionCookie, encodeSession(user), {
    httpOnly: true,
    maxAge: sessionMaxAge,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(sessionCookie, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export function createOAuthState(response: NextResponse, provider: OAuthProvider) {
  const state = crypto.randomBytes(24).toString("base64url");
  response.cookies.set(`${stateCookiePrefix}${provider}`, state, {
    httpOnly: true,
    maxAge: stateMaxAge,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return state;
}

export function setOAuthReturnTo(response: NextResponse, provider: OAuthProvider, returnTo: string | null) {
  const safeReturnTo = returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/";
  response.cookies.set(`${returnCookiePrefix}${provider}`, safeReturnTo.slice(0, 300), {
    httpOnly: true,
    maxAge: stateMaxAge,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function consumeOAuthReturnTo(provider: OAuthProvider) {
  const store = await cookies();
  const value = store.get(`${returnCookiePrefix}${provider}`)?.value;
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export async function consumeOAuthState(provider: OAuthProvider, state: string | null) {
  const store = await cookies();
  const cookieName = `${stateCookiePrefix}${provider}`;
  const expected = store.get(cookieName)?.value;
  if (!state || !expected || state.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(state), Buffer.from(expected));
}

export function clearOAuthState(response: NextResponse, provider: OAuthProvider) {
  response.cookies.set(`${stateCookiePrefix}${provider}`, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export function clearOAuthReturnTo(response: NextResponse, provider: OAuthProvider) {
  response.cookies.set(`${returnCookiePrefix}${provider}`, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

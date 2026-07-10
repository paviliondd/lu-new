import "server-only";

import type { AuthUser, OAuthProvider } from "./session";

type OAuthProfile = Omit<AuthUser, "userId">;

function siteUrl(requestUrl?: string) {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configuredUrl) return configuredUrl.replace(/\/$/, "");

  const fallbackOrigin = requestUrl ? new URL(requestUrl).origin : "http://localhost:3000";
  return fallbackOrigin.replace(/\/$/, "");
}

export function oauthRedirectUrl(returnTo: string, requestUrl?: string) {
  const safePath = returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/";
  return new URL(safePath, siteUrl(requestUrl));
}

function callbackUrl(provider: OAuthProvider, requestUrl: string) {
  const explicit =
    provider === "github" ? process.env.GITHUB_CALLBACK_URL : process.env.GOOGLE_CALLBACK_URL;
  return explicit || `${siteUrl(requestUrl)}/api/auth/${provider}/callback`;
}

export function authorizationUrl(provider: OAuthProvider, state: string, requestUrl: string) {
  if (provider === "github") {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) throw new Error("Missing GITHUB_CLIENT_ID");
    const url = new URL("https://github.com/login/oauth/authorize");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", callbackUrl("github", requestUrl));
    url.searchParams.set("scope", "read:user user:email");
    url.searchParams.set("state", state);
    return url;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("Missing GOOGLE_CLIENT_ID");
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", callbackUrl("google", requestUrl));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "select_account");
  return url;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`OAuth request failed: ${response.status}`);
  }
  return (await response.json()) as T;
}

export async function exchangeOAuthCode(
  provider: OAuthProvider,
  code: string,
  requestUrl: string
): Promise<OAuthProfile> {
  if (provider === "github") return exchangeGitHubCode(code, requestUrl);
  return exchangeGoogleCode(code, requestUrl);
}

async function exchangeGitHubCode(code: string, requestUrl: string): Promise<OAuthProfile> {
  const tokenPayload = await fetchJson<{ access_token?: string }>(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: callbackUrl("github", requestUrl),
      }),
    }
  );
  if (!tokenPayload.access_token) throw new Error("GitHub did not return an access token");

  const profile = await fetchJson<{
    id: number;
    login: string;
    name?: string | null;
    email?: string | null;
    avatar_url?: string | null;
  }>("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${tokenPayload.access_token}`,
      Accept: "application/vnd.github+json",
    },
  });
  const emails = await fetchJson<Array<{ email: string; primary: boolean; verified: boolean }>>(
    "https://api.github.com/user/emails",
    {
      headers: {
        Authorization: `Bearer ${tokenPayload.access_token}`,
        Accept: "application/vnd.github+json",
      },
    }
  ).catch(() => []);
  const email =
    profile.email ||
    emails.find((item) => item.primary && item.verified)?.email ||
    emails.find((item) => item.verified)?.email ||
    "";

  return {
    provider: "github",
    providerUserId: String(profile.id),
    name: profile.name || profile.login,
    email,
    avatar: profile.avatar_url || null,
  };
}

async function exchangeGoogleCode(code: string, requestUrl: string): Promise<OAuthProfile> {
  const body = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
    code,
    grant_type: "authorization_code",
    redirect_uri: callbackUrl("google", requestUrl),
  });
  const tokenPayload = await fetchJson<{ access_token?: string; id_token?: string }>(
    "https://oauth2.googleapis.com/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    }
  );
  if (!tokenPayload.access_token) throw new Error("Google did not return an access token");

  const profile = await fetchJson<{
    sub: string;
    name?: string;
    email?: string;
    picture?: string;
  }>("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: {
      Authorization: `Bearer ${tokenPayload.access_token}`,
    },
  });

  return {
    provider: "google",
    providerUserId: profile.sub,
    name: profile.name || profile.email || "Google user",
    email: profile.email || "",
    avatar: profile.picture || null,
  };
}

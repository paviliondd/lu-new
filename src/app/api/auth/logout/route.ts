import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth/session";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response);
  return response;
}

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url));
  clearSessionCookie(response);
  return response;
}

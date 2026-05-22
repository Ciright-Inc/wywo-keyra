import { rateLimitResponse } from "@/app/api/keyra/_routeHelpers";
import { KEYRA_SESSION_COOKIE } from "@/lib/keyraSessionCookie";
import { requireKeyraSessionUser } from "@/lib/keyraProtectionSession";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const limited = rateLimitResponse(req, "keyra-protection-lock");
  if (limited) return limited;

  const user = await requireKeyraSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const authBase = process.env.NEXT_PUBLIC_SIMSECURE_AUTH_BACKEND_URL?.trim();
  if (authBase) {
    try {
      await fetch(`${authBase.replace(/\/+$/, "")}/auth/logout`, {
        method: "POST",
        headers: { cookie: req.headers.get("cookie") ?? "" },
        cache: "no-store",
      });
    } catch {
      // continue clearing Keyra session
    }
  }

  const res = NextResponse.json({ ok: true, message: "All sessions signed out." });
  res.cookies.set({
    name: KEYRA_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return res;
}

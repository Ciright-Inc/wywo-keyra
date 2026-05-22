import {
  KEYRA_SESSION_COOKIE,
  KEYRA_SESSION_MAX_AGE,
  serializeSession,
  type KeyraSessionUser,
} from "@/lib/keyraSessionCookie";
import { loadSavedProfileFields } from "@/lib/keyraSiteUserProfileDb";
import { NextResponse } from "next/server";

type AuthProfileHint = {
  displayName?: string | null;
  fullName?: string | null;
  username?: string | null;
  email?: string | null;
};

function displayNameFromAuthHint(auth?: AuthProfileHint): string | undefined {
  const username = String(auth?.username ?? "").trim();
  if (username) return username;
  const fullName = String(auth?.fullName ?? "").trim();
  if (fullName) return fullName;
  const displayName = String(auth?.displayName ?? "").trim();
  if (displayName) return displayName;
  return undefined;
}

export async function buildKeyraSessionUser(
  phoneE164: string,
  authHint?: AuthProfileHint,
): Promise<KeyraSessionUser> {
  const saved = await loadSavedProfileFields(phoneE164);
  const fromAuth = displayNameFromAuthHint(authHint);
  return {
    phoneE164,
    displayName: saved.displayName ?? fromAuth,
    email: saved.email ?? (authHint?.email ? String(authHint.email).trim() : undefined),
    country: saved.country,
  };
}

export function jsonWithKeyraSession(
  user: KeyraSessionUser,
  body: Record<string, unknown> = { ok: true },
): NextResponse | null {
  const token = serializeSession(user);
  if (!token) return null;
  const res = NextResponse.json({ ...body, user });
  res.cookies.set({
    name: KEYRA_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: KEYRA_SESSION_MAX_AGE,
  });
  return res;
}

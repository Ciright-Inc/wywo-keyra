import "server-only";

import {
  KEYRA_SESSION_COOKIE,
  parseSession,
  type KeyraSessionUser,
} from "@/lib/keyraSessionCookie";

type AuthSessionPayload = {
  authenticated?: boolean;
  user?: { phone?: string; username?: string | null; fullName?: string | null } | null;
};

function readCookie(cookieHeader: string, name: string): string | null {
  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    if (trimmed.startsWith(`${name}=`)) {
      return decodeURIComponent(trimmed.slice(name.length + 1));
    }
  }
  return null;
}

function displayNameFromAuthUser(user: NonNullable<AuthSessionPayload["user"]>): string | undefined {
  const username = typeof user.username === "string" ? user.username.trim() : "";
  if (username) return username;
  const fullName = typeof user.fullName === "string" ? user.fullName.trim() : "";
  if (fullName) return fullName;
  return undefined;
}

function userFromAuthPayload(payload: AuthSessionPayload): KeyraSessionUser | null {
  if (!payload.authenticated || !payload.user?.phone) return null;
  const raw = payload.user.phone.trim();
  if (!raw) return null;
  const phoneE164 = raw.startsWith("+") ? raw : `+${raw.replace(/\D/g, "")}`;
  return {
    phoneE164,
    displayName: displayNameFromAuthUser(payload.user),
  };
}

async function fetchAuthBackendSession(cookieHeader: string): Promise<KeyraSessionUser | null> {
  const backend = process.env.NEXT_PUBLIC_SIMSECURE_AUTH_BACKEND_URL?.trim();
  if (!backend) return null;

  try {
    const res = await fetch(`${backend.replace(/\/+$/, "")}/auth/session`, {
      method: "GET",
      headers: { cookie: cookieHeader },
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const payload = (await res.json()) as AuthSessionPayload;
    return userFromAuthPayload(payload);
  } catch {
    return null;
  }
}

/** Resolve the same Keyra identity used by the public site session (cookie + auth backend). */
export async function resolveKeyraSessionFromRequest(req: Request): Promise<KeyraSessionUser | null> {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const keyraRaw = readCookie(cookieHeader, KEYRA_SESSION_COOKIE);
  if (keyraRaw) {
    const parsed = parseSession(keyraRaw);
    if (parsed) return parsed;
  }
  return fetchAuthBackendSession(cookieHeader);
}

export async function resolveKeyraSessionFromCookies(): Promise<KeyraSessionUser | null> {
  const { cookies, headers } = await import("next/headers");
  const jar = await cookies();
  const raw = jar.get(KEYRA_SESSION_COOKIE)?.value;
  if (raw) {
    const parsed = parseSession(raw);
    if (parsed) return parsed;
  }

  const hdrs = await headers();
  const cookieHeader = hdrs.get("cookie") ?? "";
  if (!cookieHeader) return null;
  return fetchAuthBackendSession(cookieHeader);
}

export async function resolveKeyraSessionFromNextRequest(request: {
  cookies: { get: (name: string) => { value: string } | undefined };
  headers: { get: (name: string) => string | null };
}): Promise<KeyraSessionUser | null> {
  const raw = request.cookies.get(KEYRA_SESSION_COOKIE)?.value;
  if (raw) {
    const parsed = parseSession(raw);
    if (parsed) return parsed;
  }
  const cookieHeader = request.headers.get("cookie") ?? "";
  if (!cookieHeader) return null;
  return fetchAuthBackendSession(cookieHeader);
}

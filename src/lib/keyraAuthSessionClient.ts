/**
 * Browser-side SimSecure session discovery.
 *
 * On Railway / cross-origin WYWO hosts, the same-origin `/api/auth/session` proxy
 * often returns `authenticated: false` even when the user is signed in on
 * auth.keyra.ie. Always fall through to `NEXT_PUBLIC_SIMSECURE_AUTH_BACKEND_URL`
 * before treating the user as signed out.
 */

export type AuthSessionPayload = {
  authenticated?: boolean;
  user?: {
    phone?: string;
    displayName?: string | null;
    fullName?: string | null;
    name?: string | null;
    username?: string | null;
    email?: string | null;
  } | null;
};

export function userHintFromAuthPayload(payload: AuthSessionPayload | null): {
  phoneE164: string;
  displayName?: string;
  email?: string;
} | null {
  if (!payload?.authenticated || !payload.user?.phone) return null;
  const phone = String(payload.user.phone).trim();
  const phoneE164 = phone.startsWith("+") ? phone : phone ? `+${phone}` : "";
  if (!phoneE164.startsWith("+")) return null;
  const displayName =
    String(
      payload.user.displayName ??
        payload.user.fullName ??
        payload.user.name ??
        payload.user.username ??
        "",
    ).trim() || undefined;
  const email =
    typeof payload.user.email === "string" ? payload.user.email.trim() || undefined : undefined;
  return { phoneE164, displayName, email };
}

export async function fetchBrowserAuthSession(
  signal?: AbortSignal,
): Promise<AuthSessionPayload | null> {
  let proxyPayload: AuthSessionPayload | null = null;

  try {
    const res = await fetch("/api/auth/session", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
      signal,
    });
    if (res.ok) {
      proxyPayload = (await res.json()) as AuthSessionPayload;
      if (proxyPayload.authenticated) {
        return proxyPayload;
      }
    }
  } catch {
    // continue to direct auth backend
  }

  const authBackendUrl =
    typeof process !== "undefined" ? process.env.NEXT_PUBLIC_SIMSECURE_AUTH_BACKEND_URL?.trim() : "";
  if (!authBackendUrl) {
    return proxyPayload;
  }

  try {
    const base = authBackendUrl.replace(/\/+$/, "");
    const res = await fetch(`${base}/auth/session`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
      signal,
    });
    if (res.ok) {
      return (await res.json()) as AuthSessionPayload;
    }
  } catch {
    // ignore
  }

  return proxyPayload;
}

/** True when the browser can reach auth.keyra.ie for session checks. */
export function hasDirectAuthBackendInBrowser(): boolean {
  return Boolean(
    typeof process !== "undefined" &&
      process.env.NEXT_PUBLIC_SIMSECURE_AUTH_BACKEND_URL?.trim(),
  );
}

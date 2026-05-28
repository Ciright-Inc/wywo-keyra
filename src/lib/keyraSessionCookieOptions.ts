import "server-only";

/**
 * Keyra session cookie options.
 *
 * IMPORTANT: We intentionally set a shared cookie domain on keyra.ie production so
 * `keyra_session` is readable on sibling subdomains (e.g. `admin.keyra.ie`) after
 * returning from get-started.keyra.ie.
 *
 * On localhost / previews we must NOT set a domain, otherwise cookies won't apply.
 */

function safeHostnameFromUrl(raw: string | undefined): string {
  const v = String(raw ?? "").trim();
  if (!v) return "";
  try {
    return new URL(v).hostname.toLowerCase();
  } catch {
    return "";
  }
}

export function resolveKeyraSessionCookieDomain(): string | undefined {
  const explicit = process.env.KEYRA_SESSION_COOKIE_DOMAIN?.trim();
  if (explicit) return explicit;

  if (process.env.NODE_ENV !== "production") return undefined;

  const host =
    safeHostnameFromUrl(process.env.NEXT_PUBLIC_KEYRA_SITE_URL) ||
    safeHostnameFromUrl(process.env.NEXT_PUBLIC_SITE_URL) ||
    safeHostnameFromUrl(process.env.NEXT_PUBLIC_KEYRA_MARKETING_ORIGIN) ||
    safeHostnameFromUrl(process.env.NEXT_PUBLIC_KEYRA_MARKETING_PUBLIC_ORIGIN);

  if (!host) return undefined;
  if (host === "keyra.ie" || host.endsWith(".keyra.ie")) {
    return ".keyra.ie";
  }

  return undefined;
}

export function keyraSessionCookieBaseOptions(): {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: "/";
  domain?: string;
} {
  const domain = resolveKeyraSessionCookieDomain();
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    domain,
  };
}


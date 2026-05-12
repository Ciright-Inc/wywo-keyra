/**
 * Optional split admin hostname (e.g. admin.keyra.ie). When set, requests to
 * `/admin/*` and `/api/admin/*` on any other host are redirected to this host.
 * Unset in local dev so everything stays on localhost.
 */
export function getConfiguredAdminHost(): string | null {
  const h = process.env.KEYRA_ADMIN_HOST?.trim().toLowerCase();
  return h || null;
}

export function hostnameFromHostHeader(hostHeader: string | null): string {
  if (!hostHeader) return "";
  return hostHeader.split(":")[0]!.toLowerCase();
}

export function isRequestAdminHost(hostHeader: string | null): boolean {
  const want = getConfiguredAdminHost();
  if (!want) return false;
  return hostnameFromHostHeader(hostHeader) === want;
}

/**
 * Absolute origin for redirects to the admin host (e.g. https://admin.keyra.ie).
 * Override with KEYRA_ADMIN_PUBLIC_ORIGIN when using non-HTTPS or custom ports locally.
 */
export function getAdminPublicOrigin(): string | null {
  const explicit = process.env.KEYRA_ADMIN_PUBLIC_ORIGIN?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const host = getConfiguredAdminHost();
  if (!host) return null;
  if (process.env.NODE_ENV === "production") {
    return `https://${host}`;
  }
  return `http://${host}`;
}

export function adminSplitHostEnabled(): boolean {
  return Boolean(getConfiguredAdminHost());
}

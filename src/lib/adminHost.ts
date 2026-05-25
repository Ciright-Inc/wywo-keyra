import { keyraMarketingPublicOrigin } from "@/lib/keyraAppUrls";

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
  return hostHeader.split(",")[0]!.split(":")[0]!.trim().toLowerCase();
}

/** Public hostname from proxy headers (Railway/Vercel) or Host. */
export function resolveRequestHostname(
  hostHeader: string | null,
  forwardedHostHeader: string | null,
): string {
  return (
    hostnameFromHostHeader(forwardedHostHeader) || hostnameFromHostHeader(hostHeader)
  );
}

/** Request header set by middleware/proxy so SSR can read the pathname. */
export const KEYRA_PATHNAME_HEADER = "x-keyra-pathname";

/** Nexa / Ciright analytics domain — must match the dashboard site hostname. */
export function getAdminAnalyticsDomain(): string {
  return getConfiguredAdminHost() ?? "admin.keyra.ie";
}

/** Hostnames where `/admin/*` is served without the admin subdomain. */
export function getKeyraMarketingHosts(): string[] {
  const raw = process.env.KEYRA_MARKETING_HOSTS?.trim();
  if (raw) {
    return raw
      .split(",")
      .map((h) => h.trim().toLowerCase())
      .filter(Boolean);
  }
  return ["keyra.ie", "www.keyra.ie"];
}

export function isAdminAnalyticsPath(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return normalized === "/admin" || normalized.startsWith("/admin/");
}

export function shouldLoadAdminAnalytics(
  requestHost: string,
  pathname: string,
  options?: { force?: boolean },
): boolean {
  const force = options?.force ?? false;
  if (process.env.NODE_ENV !== "production" && !force) {
    return false;
  }

  const adminDomain = getAdminAnalyticsDomain();
  if (requestHost === adminDomain) {
    return true;
  }

  if (getKeyraMarketingHosts().includes(requestHost) && isAdminAnalyticsPath(pathname)) {
    return true;
  }

  if (force && isAdminAnalyticsPath(pathname)) {
    return true;
  }

  return false;
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

function isInternalBindHostname(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return h === "0.0.0.0" || h === "127.0.0.1" || h === "[::1]" || h === "localhost";
}

/**
 * Public origin for post-login redirects. Railway/Docker often expose `0.0.0.0:8080` on `req.url`
 * while the browser uses forwarded host headers or configured admin/marketing origins.
 */
export function resolveKeyraRedirectOrigin(req: Request, nextPath: string): string {
  if (nextPath.startsWith("/admin")) {
    const adminOrigin = getAdminPublicOrigin();
    if (adminOrigin) return adminOrigin;
  }

  const host = (req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "")
    .split(",")[0]
    ?.trim() ?? "";
  const hostname = hostnameFromHostHeader(host);
  const protoHeader = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const proto =
    protoHeader === "http" || protoHeader === "https"
      ? protoHeader
      : process.env.NODE_ENV === "production"
        ? "https"
        : "http";

  if (host && hostname && !isInternalBindHostname(hostname)) {
    return `${proto}://${host}`;
  }

  return getAdminPublicOrigin() ?? keyraMarketingPublicOrigin();
}

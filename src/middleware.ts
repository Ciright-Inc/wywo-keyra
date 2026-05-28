import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js middleware.
 *
 * WYWO deployment lockdown:
 *   When this build runs as the dedicated WYWO service (e.g. wywo.keyra.ie or
 *   the Railway preview `wywo-keyra-production.up.railway.app`), only the WYWO
 *   surface should be reachable. Every other Keyra route (marketing pages,
 *   `/login`, `/admin`, etc.) redirects to `/wywo`.
 *
 * Trigger when ANY of:
 *   - env `KEYRA_DEPLOYMENT_MODE=wywo` (recommended, explicit)
 *   - env `WYWO_AS_ROOT=1`            (alias)
 *   - hostname starts with `wywo.`    (e.g. wywo.keyra.ie)
 *   - hostname contains `wywo-keyra`  (Railway preview)
 *
 * On the main Keyra site (`keyra.ie`) none of these match → app behaves
 * exactly as before and every route is reachable.
 */
function isWywoRootDeployment(req: NextRequest): boolean {
  const mode = process.env.KEYRA_DEPLOYMENT_MODE?.trim().toLowerCase();
  if (mode === "wywo") return true;
  if (process.env.WYWO_AS_ROOT === "1") return true;

  const hostHeader = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  const host = hostHeader.split(",")[0]?.trim().toLowerCase() ?? "";
  if (!host) return false;
  const hostname = host.replace(/:\d+$/, "");
  if (hostname.startsWith("wywo.")) return true;
  if (hostname.includes("wywo-keyra")) return true;
  return false;
}

// Path prefixes that are part of WYWO or shared infrastructure WYWO actually
// needs. Anything else on a WYWO deployment gets redirected to `/wywo`.
const WYWO_ALLOWED_PREFIXES = [
  "/wywo",
  "/api/wywo",
  "/api/public/site-footer", // shared footer proxy used by WYWO shell
  "/api/keyra",
  "/api/ipification",
  "/login",
  "/signup",
  "/callback",
  "/hosted-login",
  "/verify-device",
  "/_next",
  "/static",
  "/assets",
  "/images",
  "/fonts",
];

const WYWO_ALLOWED_EXACT = new Set<string>([
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.json",
  "/manifest.webmanifest",
]);

function isAllowedOnWywoDeploy(pathname: string): boolean {
  if (WYWO_ALLOWED_EXACT.has(pathname)) return true;
  for (const prefix of WYWO_ALLOWED_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return true;
  }
  // Static files (anything with a real file extension served from /public).
  if (/\.[a-zA-Z0-9]{1,6}$/.test(pathname)) return true;
  return false;
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Guard against accidental duplicated WYWO base path (e.g. /wywo/wywo).
  // This can happen when composing `next` paths across multiple redirects.
  if (pathname === "/wywo/wywo" || pathname.startsWith("/wywo/wywo/")) {
    const url = req.nextUrl.clone();
    url.pathname = "/wywo";
    // preserve search params (useful for debug) but drop double base
    return NextResponse.redirect(url, 307);
  }

  if (!isWywoRootDeployment(req)) {
    return NextResponse.next();
  }

  // Already inside the WYWO surface or required shared infrastructure.
  if (isAllowedOnWywoDeploy(pathname)) {
    return NextResponse.next();
  }

  // Everything else on a WYWO deployment lands on the WYWO dashboard.
  const url = req.nextUrl.clone();
  url.pathname = "/wywo";
  url.search = ""; // drop any keyra-marketing query params

  // Use a 307 so the browser doesn't permanently cache the redirect — handy
  // if we later open up more routes (e.g. /help, /privacy) on this deploy.
  void search;
  return NextResponse.redirect(url, 307);
}

export const config = {
  // Match every request except the ones Next.js already serves as internal
  // assets. We still re-check inside the function so non-WYWO deployments are
  // a no-op.
  matcher: ["/((?!_next/static|_next/image).*)"],
};

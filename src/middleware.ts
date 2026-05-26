import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js middleware.
 *
 * WYWO deployment hint:
 *   When this build runs as the dedicated WYWO service (e.g. wywo.keyra.ie or
 *   the Railway preview `wywo-keyra-production.up.railway.app`), the root URL
 *   should land users on `/wywo` instead of the Keyra marketing homepage.
 *
 * Trigger when ANY of:
 *   - env `KEYRA_DEPLOYMENT_MODE=wywo` (recommended, explicit)
 *   - env `WYWO_AS_ROOT=1`            (alias)
 *   - hostname starts with `wywo.`    (e.g. wywo.keyra.ie)
 *   - hostname contains `wywo-keyra`  (Railway preview)
 *
 * On the main Keyra site (`keyra.ie`) none of these match → homepage renders normally.
 *
 * Only the bare `/` path is redirected; everything else (assets, APIs, /admin, etc.)
 * is left alone so the rest of the app keeps working.
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

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/" && isWywoRootDeployment(req)) {
    const url = req.nextUrl.clone();
    url.pathname = "/wywo";
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}

export const config = {
  // Run only on the exact root path — keep every other route untouched.
  matcher: ["/"],
};

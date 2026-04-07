import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Prevent stale HTML at CDNs/browsers from referencing old hashed `/_next/static/chunks/*`
 * after a new deploy (chunk names change every build → 404 + net::ERR_ABORTED).
 * Static assets under `/_next/static` keep Next.js default immutable caching.
 */
export function middleware(_request: NextRequest) {
  const res = NextResponse.next();
  res.headers.set(
    "Cache-Control",
    "private, no-cache, no-store, max-age=0, must-revalidate",
  );
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  // Help some CDNs honour no-store for document-style responses
  res.headers.set("CDN-Cache-Control", "no-store");
  return res;
}

export const config = {
  matcher: [
    "/",
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};

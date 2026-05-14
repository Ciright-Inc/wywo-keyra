import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { keyraDesignLaneFromPathname, LANE_HEADER } from "@/lib/keyraDesignLane";

/**
 * Cache-busting for HTML shells + IPIFICATION POST → GET bridge + design lane for SSR theming.
 */
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname.replace(/\/+$/, "") || "/";
  if (path === "/callback" && request.method === "POST") {
    const url = request.nextUrl.clone();
    url.pathname = "/api/ipification/oidc-return";
    return NextResponse.rewrite(url);
  }

  const lane = keyraDesignLaneFromPathname(request.nextUrl.pathname);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(LANE_HEADER, lane);

  const res = NextResponse.next({
    request: { headers: requestHeaders },
  });
  res.headers.set("Cache-Control", "private, no-cache, no-store, max-age=0, must-revalidate");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  res.headers.set("CDN-Cache-Control", "no-store");
  return res;
}

export const config = {
  matcher: [
    "/",
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};

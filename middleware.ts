import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  adminSplitHostEnabled,
  getAdminPublicOrigin,
  isRequestAdminHost,
} from "@/lib/adminHost";
import { keyraDesignLaneFromPathname, LANE_HEADER } from "@/lib/keyraDesignLane";

function redirectToAdminHost(request: NextRequest): NextResponse | null {
  const base = getAdminPublicOrigin();
  if (!base) return null;
  const dest = new URL(`${request.nextUrl.pathname}${request.nextUrl.search}`, base);
  return NextResponse.redirect(dest, 307);
}

/** Design lane for SSR theming + no-store for HTML shells (merged from prior src/middleware). */
function nextForAppShell(request: NextRequest): NextResponse {
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

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host");
  const { pathname } = request.nextUrl;
  const pathNorm = pathname.replace(/\/+$/, "") || "/";

  if (pathNorm === "/callback" && request.method === "POST") {
    const url = request.nextUrl.clone();
    url.pathname = "/api/ipification/oidc-return";
    return NextResponse.rewrite(url);
  }

  if (adminSplitHostEnabled() && isRequestAdminHost(host) && pathname === "/") {
    return NextResponse.redirect(new URL("/admin/deployments", request.url));
  }

  if (adminSplitHostEnabled() && !isRequestAdminHost(host)) {
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
      const r = redirectToAdminHost(request);
      if (r) return r;
    }
  }

  const isAdminUi = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (!isAdminUi && !isAdminApi) {
    return nextForAppShell(request);
  }

  if (pathname.startsWith("/admin/login")) {
    return nextForAppShell(request);
  }

  if (pathname.startsWith("/api/admin/auth")) {
    return nextForAppShell(request);
  }

  return nextForAppShell(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|json)$).*)",
  ],
};

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { adminIsConfigured, isAuthorizedAdmin } from "@/lib/adminAuth";
import {
  adminSplitHostEnabled,
  getAdminPublicOrigin,
  isRequestAdminHost,
} from "@/lib/adminHost";

function redirectToAdminHost(request: NextRequest): NextResponse | null {
  const base = getAdminPublicOrigin();
  if (!base) return null;
  const dest = new URL(`${request.nextUrl.pathname}${request.nextUrl.search}`, base);
  return NextResponse.redirect(dest, 307);
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host");
  const { pathname } = request.nextUrl;

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
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admin/auth")) {
    return NextResponse.next();
  }

  if (!adminIsConfigured()) {
    if (isAdminApi) {
      return NextResponse.json({ error: "Admin is not configured." }, { status: 503 });
    }
    return new NextResponse("Admin is not configured.", { status: 503 });
  }

  if (await isAuthorizedAdmin(request)) {
    return NextResponse.next();
  }

  if (isAdminApi) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/", "/admin/:path*", "/api/admin/:path*"],
};

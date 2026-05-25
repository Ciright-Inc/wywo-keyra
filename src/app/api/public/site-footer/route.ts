import { NextResponse } from "next/server";
import { keyraMarketingOrigin, keyraMarketingPublicOrigin } from "@/lib/keyraAppUrls";
import { getPublicSiteFooterConfig } from "@/lib/siteFooter/queries";
import type { SiteFooterConfig } from "@/lib/siteFooter/types";

export const dynamic = "force-dynamic";

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=0, s-maxage=60, must-revalidate",
} as const;

const DEV_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
} as const;

/** Same allowlist as `/api/deployments/apps/launcher` — Keyra ecosystem + local dev. */
function corsHeaders(origin: string | null): HeadersInit {
  if (!origin) return {};
  const allowed =
    origin.endsWith(".keyra.ie") ||
    origin === "https://keyra.ie" ||
    origin.startsWith("http://localhost:") ||
    origin.startsWith("http://127.0.0.1:");
  if (!allowed) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Max-Age": "86400",
  };
}

function trimSlash(s: string): string {
  return s.replace(/\/+$/, "");
}

function isSiteFooterConfig(value: unknown): value is SiteFooterConfig {
  if (!value || typeof value !== "object") return false;
  const payload = value as SiteFooterConfig;
  return (
    Boolean(payload.settings) &&
    Array.isArray(payload.onThisSiteLinks) &&
    Array.isArray(payload.keyraAppLinks) &&
    Array.isArray(payload.socialLinks)
  );
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("origin")),
  });
}

/** Published site footer — DB on production; proxies live keyra.ie CMS in local dev. */
export async function GET(req: Request) {
  const isDev = process.env.NODE_ENV === "development";
  const siteOrigin = trimSlash(keyraMarketingOrigin());
  const cmsOrigin = trimSlash(keyraMarketingPublicOrigin());
  const responseHeaders = {
    ...corsHeaders(req.headers.get("origin")),
    ...(isDev ? DEV_CACHE_HEADERS : CACHE_HEADERS),
  };

  if (isDev || siteOrigin !== cmsOrigin) {
    try {
      const res = await fetch(`${cmsOrigin}/api/public/site-footer`, { cache: "no-store" });
      if (res.ok) {
        const data: unknown = await res.json();
        if (isSiteFooterConfig(data)) {
          return NextResponse.json(data, { headers: responseHeaders });
        }
      }
    } catch {
      /* fall through to local DB / defaults */
    }
  }

  const footer = await getPublicSiteFooterConfig();
  return NextResponse.json(footer, { headers: responseHeaders });
}

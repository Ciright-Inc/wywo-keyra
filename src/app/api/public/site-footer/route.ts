import { NextResponse } from "next/server";
import { keyraMarketingOrigin, keyraMarketingPublicOrigin } from "@/lib/keyraAppUrls";
import { getPublicSiteFooterConfig } from "@/lib/siteFooter/queries";
import type { SiteFooterConfig } from "@/lib/siteFooter/types";

export const dynamic = "force-dynamic";

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
} as const;

const DEV_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
} as const;

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

/** Published site footer — DB on production; proxies live keyra.ie CMS in local dev. */
export async function GET() {
  const isDev = process.env.NODE_ENV === "development";
  const siteOrigin = trimSlash(keyraMarketingOrigin());
  const cmsOrigin = trimSlash(keyraMarketingPublicOrigin());

  if (isDev || siteOrigin !== cmsOrigin) {
    try {
      const res = await fetch(`${cmsOrigin}/api/public/site-footer`, isDev ? { cache: "no-store" } : { next: { revalidate: 60 } });
      if (res.ok) {
        const data: unknown = await res.json();
        if (isSiteFooterConfig(data)) {
          return NextResponse.json(data, { headers: isDev ? DEV_CACHE_HEADERS : CACHE_HEADERS });
        }
      }
    } catch {
      /* fall through to local DB / defaults */
    }
  }

  const footer = await getPublicSiteFooterConfig();
  return NextResponse.json(footer, { headers: isDev ? DEV_CACHE_HEADERS : CACHE_HEADERS });
}

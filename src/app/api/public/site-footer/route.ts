import { NextResponse } from "next/server";
import { keyraMarketingOrigin, keyraMarketingPublicOrigin } from "@/lib/keyraAppUrls";
import {
  fallbackSiteFooterPayload,
  isSiteFooterPayload,
  publishedFooterLinks,
} from "@/lib/siteFooter";

export const dynamic = "force-dynamic";

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
};

function trimSlash(s: string): string {
  return s.replace(/\/+$/, "");
}

/** GET /api/public/site-footer — proxies live CMS (keyra.ie) for local dev and split hosts. */
export async function GET() {
  const siteOrigin = trimSlash(keyraMarketingOrigin());
  const cmsOrigin = trimSlash(keyraMarketingPublicOrigin());
  const isDev = process.env.NODE_ENV === "development";
  const shouldProxy = isDev || siteOrigin !== cmsOrigin;

  if (shouldProxy) {
    try {
      const res = await fetch(`${cmsOrigin}/api/public/site-footer`, isDev ? { cache: "no-store" } : { next: { revalidate: 60 } });
      if (res.ok) {
        const data: unknown = await res.json();
        if (isSiteFooterPayload(data)) {
          const headers = isDev
            ? { "Cache-Control": "no-store, no-cache, must-revalidate" }
            : CACHE_HEADERS;
          return NextResponse.json(
            {
              settings: { ...fallbackSiteFooterPayload().settings, ...data.settings },
              onThisSiteLinks: publishedFooterLinks(data.onThisSiteLinks),
              keyraAppLinks: publishedFooterLinks(data.keyraAppLinks),
              socialLinks: publishedFooterLinks(data.socialLinks),
            },
            { headers },
          );
        }
      }
    } catch {
      /* fall through to local fallback */
    }
  }

  const fallback = fallbackSiteFooterPayload();
  return NextResponse.json(fallback, { headers: CACHE_HEADERS });
}

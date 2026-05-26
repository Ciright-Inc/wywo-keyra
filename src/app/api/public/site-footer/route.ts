import { NextResponse } from "next/server";
import { listDeploymentApps } from "@/lib/deploymentApps";
import { keyraMarketingOrigin, keyraMarketingPublicOrigin } from "@/lib/keyraAppUrls";
import { getPublicSiteFooterConfig } from "@/lib/siteFooter/queries";
import {
  buildFooterSiteAppOptions,
  resolveFooterSiteAppIdFromRequest,
} from "@/lib/siteFooter/siteAppScope";
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

/** Published site footer — proxies https://keyra.ie/api/public/site-footer
 * whenever this deployment is not the upstream itself; falls back to the local
 * DB / seed if the upstream is unreachable. */
export async function GET(req: Request) {
  const isDev = process.env.NODE_ENV === "development";
  const siteOrigin = trimSlash(keyraMarketingOrigin());
  const cmsOrigin = trimSlash(keyraMarketingPublicOrigin());
  const requestUrl = new URL(req.url);
  const siteAppIdParam = requestUrl.searchParams.get("siteAppId");
  const deploymentApps = await listDeploymentApps({ includeInactive: true, includePrivate: true });
  const footerSiteApps = buildFooterSiteAppOptions(deploymentApps);
  const siteAppId = resolveFooterSiteAppIdFromRequest(req.url, req.headers, footerSiteApps, siteAppIdParam);
  const responseHeaders = {
    ...corsHeaders(req.headers.get("origin")),
    ...(isDev ? DEV_CACHE_HEADERS : CACHE_HEADERS),
  };

  // Live source of truth is https://keyra.ie/api/public/site-footer.
  // Proxy to it whenever we are NOT that upstream (dev + non-marketing prod
  // deployments). Falls through to the local DB if the upstream is unreachable.
  if (siteOrigin !== cmsOrigin) {
    try {
      const proxyUrl = new URL(`${cmsOrigin}/api/public/site-footer`);
      if (siteAppIdParam) proxyUrl.searchParams.set("siteAppId", siteAppIdParam);
      const res = await fetch(proxyUrl.toString(), {
        cache: "no-store",
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(3500),
      });
      if (res.ok) {
        const text = await res.text();
        if (text.trim()) {
          const data: unknown = JSON.parse(text);
          if (isSiteFooterConfig(data)) {
            return NextResponse.json(data, { headers: responseHeaders });
          }
        }
      }
    } catch {
      /* fall through to local DB / defaults */
    }
  }

  const footer = await getPublicSiteFooterConfig(siteAppId);
  return NextResponse.json(footer, { headers: responseHeaders });
}

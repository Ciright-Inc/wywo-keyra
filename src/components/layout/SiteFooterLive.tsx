"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SiteFooterView } from "@/components/layout/SiteFooterView";
import { isMinimalMarketingChrome } from "@/lib/marketingChrome";
import type { SiteFooterConfig } from "@/lib/siteFooter/types";

export const siteFooterClientApiPath = "/api/public/site-footer";

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

/**
 * Footer with SSR data for first paint, then a client fetch from `/api/public/site-footer`
 * so updates appear without multiple full-page refreshes (RSC / CDN caches can lag the API).
 */
export function SiteFooterLive({ initialData }: { initialData: SiteFooterConfig }) {
  const pathname = usePathname() ?? "";
  const [config, setConfig] = useState(initialData);

  useEffect(() => {
    setConfig(initialData);
  }, [initialData]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(siteFooterClientApiPath, { cache: "no-store" });
        if (!res.ok || cancelled) return;

        const raw: unknown = await res.json();
        if (!isSiteFooterConfig(raw) || cancelled) return;

        setConfig(raw);
      } catch {
        /* keep SSR initialData */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (isMinimalMarketingChrome(pathname)) return null;

  return <SiteFooterView config={config} />;
}

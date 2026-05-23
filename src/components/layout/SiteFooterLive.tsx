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
 * Footer with SSR data. In development, also fetches `/api/public/site-footer` in the
 * browser so the request appears in DevTools → Network (server-only fetch does not).
 */
export function SiteFooterLive({ initialData }: { initialData: SiteFooterConfig }) {
  const pathname = usePathname() ?? "";
  const [config, setConfig] = useState(initialData);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

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

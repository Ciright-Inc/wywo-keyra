"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SiteFooterContent } from "@/components/layout/SiteFooterContent";
import { isMinimalMarketingChrome } from "@/lib/marketingChrome";
import {
  isSiteFooterPayload,
  normalizeSiteFooterPayload,
  siteFooterClientApiPath,
  type SiteFooterPayload,
} from "@/lib/siteFooter";

/**
 * Footer with SSR data. In development, also fetches `/api/public/site-footer` in the
 * browser so the request appears in DevTools → Network (server-only fetch does not).
 */
export function SiteFooterLive({ initialData }: { initialData: SiteFooterPayload }) {
  const pathname = usePathname() ?? "";
  const [data, setData] = useState(initialData);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(siteFooterClientApiPath(), { cache: "no-store" });
        if (!res.ok || cancelled) return;

        const raw: unknown = await res.json();
        if (!isSiteFooterPayload(raw) || cancelled) return;

        setData(normalizeSiteFooterPayload(raw));
      } catch {
        /* keep SSR initialData */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (isMinimalMarketingChrome(pathname)) return null;

  return <SiteFooterContent data={data} />;
}

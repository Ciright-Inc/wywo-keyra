"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { buildGetStartedAccessUrl, keyraMarketingOrigin } from "@/lib/keyraAppUrls";

/**
 * Get Started link with a stable SSR/first-paint href (marketing origin from env),
 * then updates to the browser origin after mount to avoid hydration mismatches.
 */
export function useGetStartedAccessHref(hash = "") {
  const pathname = usePathname();
  const suffix = hash ? (hash.startsWith("#") ? hash : `#${hash}`) : "";

  const [href, setHref] = useState(() => {
    const base = keyraMarketingOrigin();
    const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
    return buildGetStartedAccessUrl(`${base}${path}${suffix}`);
  });

  useEffect(() => {
    setHref(
      buildGetStartedAccessUrl(
        `${window.location.origin}${pathname}${window.location.search || ""}${suffix}`,
      ),
    );
  }, [pathname, suffix]);

  return href;
}

"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { adminHrefMatchesPathname } from "@/lib/admin/adminRouteTab";

type NavActiveOptions = {
  /** Only match the exact href (used for section overview roots). */
  exact?: boolean;
};

/** Sidebar tab navigation: instant route loading UI (page header + list skeleton). */
export function useAdminShellNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    if (!pendingHref) return;
    if (!adminHrefMatchesPathname(pendingHref, pathname)) return;

    let innerFrame = 0;
    const outerFrame = requestAnimationFrame(() => {
      innerFrame = requestAnimationFrame(() => {
        setPendingHref(null);
      });
    });

    return () => {
      cancelAnimationFrame(outerFrame);
      if (innerFrame) cancelAnimationFrame(innerFrame);
    };
  }, [pathname, pendingHref]);

  const navigate = useCallback(
    (href: string) => {
      if (href === pathname || href === pendingHref) return;
      setPendingHref(href);
      router.push(href);
    },
    [pathname, pendingHref, router],
  );

  const prefetch = useCallback(
    (href: string) => {
      void router.prefetch(href);
    },
    [router],
  );

  const isNavActive = useCallback(
    (href: string, options?: NavActiveOptions) => {
      const current = pendingHref ?? pathname;
      if (options?.exact) return current === href;
      return current === href || current.startsWith(`${href}/`);
    },
    [pathname, pendingHref],
  );

  return { navigate, prefetch, isNavActive, pendingHref };
}

"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useTransition, useState } from "react";
import { normalizeAdminHref } from "@/lib/admin/normalizeAdminHref";

type NavActiveOptions = {
  /** Only match the exact href (used for section overview roots). */
  exact?: boolean;
};

/** Soft navigation: keep current page visible with a light pending state instead of route loading UI. */
export function useAdminRouteTransition() {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const currentHref = normalizeAdminHref(
    searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname,
  );

  useEffect(() => {
    if (!pendingHref) return;
    if (normalizeAdminHref(pendingHref) === currentHref) {
      setPendingHref(null);
    }
  }, [currentHref, pendingHref]);

  const navigate = useCallback(
    (href: string) => {
      const target = normalizeAdminHref(href);
      if (target === currentHref || target === normalizeAdminHref(pendingHref ?? "")) return;
      setPendingHref(target);
      startTransition(() => {
        router.push(href);
      });
    },
    [currentHref, pendingHref, router],
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

  return { isPending, navigate, prefetch, isNavActive, pendingHref };
}

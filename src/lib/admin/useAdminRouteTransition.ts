"use client";

import { useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";

/** Soft navigation: keep current list visible with a light pending state instead of route loading UI. */
export function useAdminRouteTransition() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const navigate = useCallback(
    (href: string) => {
      startTransition(() => {
        router.push(href);
      });
    },
    [router],
  );

  return { isPending, navigate };
}

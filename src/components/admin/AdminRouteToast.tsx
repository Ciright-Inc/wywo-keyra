"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/Toast";
import { toastFromAdminQuery } from "@/lib/admin/adminToastMessages";

function AdminRouteToastInner() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const handled = useRef<string | null>(null);

  useEffect(() => {
    const action = searchParams.get("toast");
    if (!action) return;

    const key = `${pathname}?${searchParams.toString()}`;
    if (handled.current === key) return;
    handled.current = key;

    const payload = toastFromAdminQuery(searchParams);
    if (payload) toast.success(payload.title, payload.message);

    const next = new URLSearchParams(searchParams);
    next.delete("toast");
    next.delete("entity");
    next.delete("name");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, searchParams, toast]);

  return null;
}

export function AdminRouteToast() {
  return (
    <Suspense fallback={null}>
      <AdminRouteToastInner />
    </Suspense>
  );
}

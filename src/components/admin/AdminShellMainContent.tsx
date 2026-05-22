"use client";

import type { ReactNode } from "react";
import { AdminTabRouteLoading } from "@/components/admin/AdminTabRouteLoading";
import { adminTabForHref } from "@/lib/admin/adminRouteTab";

type Props = {
  children: ReactNode;
  pendingHref: string | null;
  className?: string;
  id?: string;
};

/** Swap main content to the target tab's header + list skeleton the moment a tab is clicked. */
export function AdminShellMainContent({ children, pendingHref, className, id }: Props) {
  const loadingTab = pendingHref ? adminTabForHref(pendingHref) : null;

  return (
    <div id={id} className={className}>
      {loadingTab ? <AdminTabRouteLoading tab={loadingTab} /> : children}
    </div>
  );
}

import type { ReactNode } from "react";
import { AdminDashboardShell } from "@/components/admin/AdminDashboardShell";
import { assertAdminServer } from "@/lib/assertAdminServer";

/** Prisma-backed admin segment: never prerender at build time (DB may be unavailable). */
export const dynamic = "force-dynamic";

export default async function AdminDeploymentsLayout({ children }: { children: ReactNode }) {
  await assertAdminServer();
  return <AdminDashboardShell>{children}</AdminDashboardShell>;
}

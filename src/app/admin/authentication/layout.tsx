import type { ReactNode } from "react";
import { AdminDashboardShell } from "@/components/admin/AdminDashboardShell";
import { assertAdminServer } from "@/lib/assertAdminServer";

export const dynamic = "force-dynamic";

export default async function AuthenticationAdminLayout({ children }: { children: ReactNode }) {
  await assertAdminServer();
  return <AdminDashboardShell>{children}</AdminDashboardShell>;
}

import type { ReactNode } from "react";
import { AdminDeploymentsShell } from "./AdminDeploymentsShell";
import { assertAdminServer } from "@/lib/assertAdminServer";

/** Prisma-backed admin segment: never prerender at build time (DB may be unavailable). */
export const dynamic = "force-dynamic";

export default async function AdminDeploymentsLayout({ children }: { children: ReactNode }) {
  await assertAdminServer();
  return <AdminDeploymentsShell>{children}</AdminDeploymentsShell>;
}

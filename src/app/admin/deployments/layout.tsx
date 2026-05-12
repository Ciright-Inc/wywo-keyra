import type { ReactNode } from "react";
import { AdminDeploymentsShell } from "./AdminDeploymentsShell";

/** Prisma-backed admin segment: never prerender at build time (DB may be unavailable). */
export const dynamic = "force-dynamic";

export default function AdminDeploymentsLayout({ children }: { children: ReactNode }) {
  return <AdminDeploymentsShell>{children}</AdminDeploymentsShell>;
}

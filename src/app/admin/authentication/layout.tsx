import type { ReactNode } from "react";
import { AuthenticationAdminShell } from "./AuthenticationAdminShell";
import { assertAdminServer } from "@/lib/assertAdminServer";

export const dynamic = "force-dynamic";

export default async function AuthenticationAdminLayout({ children }: { children: ReactNode }) {
  await assertAdminServer();
  return <AuthenticationAdminShell>{children}</AuthenticationAdminShell>;
}

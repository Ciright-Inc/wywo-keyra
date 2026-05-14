import type { ReactNode } from "react";
import { AuthenticationAdminShell } from "./AuthenticationAdminShell";

export const dynamic = "force-dynamic";

export default function AuthenticationAdminLayout({ children }: { children: ReactNode }) {
  return <AuthenticationAdminShell>{children}</AuthenticationAdminShell>;
}

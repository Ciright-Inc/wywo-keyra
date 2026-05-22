import "server-only";

import { redirect } from "next/navigation";
import {
  resolveAdminAccessState,
  resolveDeploymentAuthFromCookies,
} from "@/lib/deployments/adminContext";
import type { DeploymentAuth } from "@/lib/deployments/adminAuthz";

function adminLoginHref(nextPath: string, reason?: "sign_in" | "no_access"): string {
  const sp = new URLSearchParams();
  if (nextPath.startsWith("/admin")) sp.set("next", nextPath);
  if (reason) sp.set("reason", reason);
  const q = sp.toString();
  return `/admin/login${q ? `?${q}` : ""}`;
}

export async function assertAdminServer(nextPath = "/admin/deployments"): Promise<DeploymentAuth> {
  const auth = await resolveDeploymentAuthFromCookies();
  if (auth) return auth;

  const access = await resolveAdminAccessState();
  if (access.status === "unsigned") {
    redirect(adminLoginHref(nextPath, "sign_in"));
  }
  redirect(adminLoginHref(nextPath, "no_access"));
}

import { redirect } from "next/navigation";
import { resolveDeploymentAuthFromCookies } from "@/lib/deployments/adminContext";
import type { DeploymentAuth } from "@/lib/deployments/adminAuthz";

export async function assertAdminServer(): Promise<DeploymentAuth> {
  const auth = await resolveDeploymentAuthFromCookies();
  if (!auth) {
    redirect("/admin/login");
  }
  return auth;
}

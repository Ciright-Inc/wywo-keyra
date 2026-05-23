import { requireDeploymentAuth } from "@/lib/deployments/adminContext";
import { denyIfReadOnly, isGlobal } from "@/lib/deployments/adminAuthz";
import type { DeploymentAuth } from "@/lib/deployments/adminAuthz";

export async function requireSiteFooterReadAuth(req: Request): Promise<DeploymentAuth | Response> {
  return requireDeploymentAuth(req);
}

export async function requireSiteFooterWriteAuth(req: Request): Promise<DeploymentAuth | Response> {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;

  const readOnly = denyIfReadOnly(auth);
  if (readOnly) return readOnly;

  if (!isGlobal(auth)) {
    return new Response(JSON.stringify({ error: "Forbidden: global admin required." }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  return auth;
}

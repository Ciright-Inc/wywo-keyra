import type { DeploymentAuth } from "@/lib/deployments/adminAuthz";
import {
  denyIfComplianceOnlyWriter,
  denyIfReadOnly,
  isGlobal,
} from "@/lib/deployments/adminAuthz";
import { NextResponse } from "next/server";

export function requireGlobalFeedWrite(auth: DeploymentAuth): Response | null {
  const ro = denyIfReadOnly(auth);
  if (ro) return ro;
  const co = denyIfComplianceOnlyWriter(auth);
  if (co) return co;
  if (!isGlobal(auth)) {
    return NextResponse.json(
      { error: "Only global administrators can modify the authentication feed." },
      { status: 403 },
    );
  }
  return null;
}

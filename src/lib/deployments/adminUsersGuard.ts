import type { DeploymentAuth } from "@/lib/deployments/adminAuthz";
import {
  denyIfComplianceOnlyWriter,
  denyIfReadOnly,
  isGlobal,
} from "@/lib/deployments/adminAuthz";
import { NextResponse } from "next/server";

export function requireGlobalAdminUserRead(auth: DeploymentAuth): Response | null {
  if (!isGlobal(auth)) {
    return NextResponse.json(
      { error: "Only global administrators can view admin users." },
      { status: 403 },
    );
  }
  return null;
}

export function requireGlobalAdminUserWrite(auth: DeploymentAuth): Response | null {
  const ro = denyIfReadOnly(auth);
  if (ro) return ro;
  const co = denyIfComplianceOnlyWriter(auth);
  if (co) return co;
  if (!isGlobal(auth)) {
    return NextResponse.json(
      { error: "Only global administrators can modify admin users." },
      { status: 403 },
    );
  }
  return null;
}

export function currentAdminUserId(auth: DeploymentAuth): string | null {
  return auth.kind === "user" ? auth.user.id : null;
}

import { NextResponse } from "next/server";
import { RequestApprovalStatus, RequestVerificationStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import { readJsonObject } from "@/app/api/keyra/_routeHelpers";
import { writeAudit } from "@/app/api/admin/deployments/_audit";
import { canApproveAccessRequestRow, requireDeploymentAuth } from "@/lib/deployments/adminContext";
import { denyIfReadOnly } from "@/lib/deployments/adminAuthz";
import type { DeploymentAuth } from "@/lib/deployments/adminAuthz";

type Params = { id: string };

function actorLabel(auth: DeploymentAuth): string {
  if (auth.kind === "legacy_super") return "legacy-service";
  return auth.user.email;
}

export async function PATCH(req: Request, context: { params: Promise<Params> }) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const d = denyIfReadOnly(auth);
  if (d) return d;

  const { id } = await context.params;
  const row = await prisma.serverAccessRequest.findUnique({ where: { id } });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const can = await canApproveAccessRequestRow(auth, {
    targetType: row.targetType,
    targetId: row.targetId,
  });
  if (!can) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const body = await readJsonObject(req);
  const approvalStatusRaw = body.approvalStatus;
  if (approvalStatusRaw !== "APPROVED" && approvalStatusRaw !== "REJECTED") {
    return NextResponse.json({ error: "Invalid approvalStatus." }, { status: 400 });
  }

  const actor = actorLabel(auth);

  if (approvalStatusRaw === "APPROVED") {
    if (row.verificationStatus !== RequestVerificationStatus.VERIFIED) {
      return NextResponse.json({ error: "Request is not verified yet." }, { status: 400 });
    }
    if (row.approvalStatus !== RequestApprovalStatus.PENDING) {
      return NextResponse.json({ error: "Request is not pending approval." }, { status: 400 });
    }

    const updated = await prisma.serverAccessRequest.update({
      where: { id },
      data: {
        approvalStatus: RequestApprovalStatus.APPROVED,
        approvedBy: actor,
        approvedAt: new Date(),
      },
    });

    await writeAudit({
      entityType: "ServerAccessRequest",
      entityId: id,
      action: "APPROVE",
      payload: {},
    });

    return NextResponse.json({ request: updated });
  }

  const rejectionReason =
    typeof body.rejectionReason === "string" ? body.rejectionReason.trim() : "";
  if (!rejectionReason) {
    return NextResponse.json({ error: "rejectionReason is required." }, { status: 400 });
  }

  const updated = await prisma.serverAccessRequest.update({
    where: { id },
    data: {
      approvalStatus: RequestApprovalStatus.REJECTED,
      rejectedBy: actor,
      rejectedAt: new Date(),
      rejectionReason,
    },
  });

  await writeAudit({
    entityType: "ServerAccessRequest",
    entityId: id,
    action: "REJECT",
    payload: { rejectionReason },
  });

  return NextResponse.json({ request: updated });
}

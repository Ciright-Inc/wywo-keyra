import { NextResponse } from "next/server";
import { StatusHistoryTargetType } from "@prisma/client";
import prisma from "@/lib/prisma";
import { readJsonObject } from "@/app/api/keyra/_routeHelpers";
import {
  notifyDeploymentStatusChanged,
  revalidateDeploymentsAfterMutation,
  writeAudit,
  writeStatusHistory,
} from "@/app/api/admin/deployments/_audit";
import { parseBoolean, parseDeploymentStatus, parseIntOrNull } from "@/app/api/admin/deployments/_parse";
import { requireDeploymentAuth } from "@/lib/deployments/adminContext";
import { canPatchTelco, denyIfComplianceOnlyWriter, denyIfReadOnly } from "@/lib/deployments/adminAuthz";

type Params = { id: string };

export async function PATCH(req: Request, context: { params: Promise<Params> }) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const d = denyIfReadOnly(auth);
  if (d) return d;
  const d2 = denyIfComplianceOnlyWriter(auth);
  if (d2) return d2;

  const { id } = await context.params;
  const existing = await prisma.telcoDeployment.findUnique({
    where: { id },
    include: { country: { select: { id: true, regionId: true } } },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!canPatchTelco(auth, existing, existing.country)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const body = await readJsonObject(req);
  const data: Record<string, unknown> = {};

  if (typeof body.countryId === "string") data.countryId = body.countryId.trim();
  if (typeof body.name === "string") data.name = body.name.trim();
  if (typeof body.slug === "string") data.slug = body.slug.trim().toLowerCase();
  if (typeof body.telcoSubdomain === "string") {
    data.telcoSubdomain = body.telcoSubdomain.trim().toLowerCase();
  }
  const subscribers = parseIntOrNull(body.subscribers);
  if (subscribers !== undefined) data.subscribers = subscribers;
  if (typeof body.subscribersDisplay === "string") {
    data.subscribersDisplay = body.subscribersDisplay.trim();
  }
  if (typeof body.officialDomain === "string") data.officialDomain = body.officialDomain.trim();
  if (typeof body.statusNote === "string") data.statusNote = body.statusNote.trim();
  if (typeof body.sourceLabel === "string") data.sourceLabel = body.sourceLabel.trim();
  if (typeof body.sourceUrl === "string") data.sourceUrl = body.sourceUrl.trim();
  if (typeof body.sourceVerifiedAt === "string") {
    data.sourceVerifiedAt = body.sourceVerifiedAt.trim().length
      ? new Date(body.sourceVerifiedAt)
      : null;
  }
  const sortOrder = parseIntOrNull(body.sortOrder);
  if (sortOrder !== undefined) data.sortOrder = sortOrder;
  const isPublished = parseBoolean(body.isPublished);
  if (isPublished !== undefined) data.isPublished = isPublished;

  const nextStatus = parseDeploymentStatus(body.status);
  if (nextStatus && nextStatus !== existing.status) {
    data.status = nextStatus;
  }

  const updated = await prisma.telcoDeployment.update({
    where: { id },
    data,
  });

  if (nextStatus && nextStatus !== existing.status) {
    await writeStatusHistory({
      targetType: StatusHistoryTargetType.TELCO,
      targetId: id,
      previousStatus: existing.status,
      nextStatus,
      reason: typeof body.statusChangeReason === "string" ? body.statusChangeReason : null,
    });
    notifyDeploymentStatusChanged({
      entityType: "TelcoDeployment",
      entityId: id,
      previousStatus: existing.status,
      nextStatus,
    });
  }

  await writeAudit({
    entityType: "TelcoDeployment",
    entityId: id,
    action: "PATCH",
    payload: body,
  });
  revalidateDeploymentsAfterMutation();

  return NextResponse.json({ telco: updated });
}

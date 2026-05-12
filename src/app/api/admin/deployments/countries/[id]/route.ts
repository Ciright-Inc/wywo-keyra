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
import { canPatchCountry, denyIfComplianceOnlyWriter, denyIfReadOnly } from "@/lib/deployments/adminAuthz";

type Params = { id: string };

export async function PATCH(req: Request, context: { params: Promise<Params> }) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const d = denyIfReadOnly(auth);
  if (d) return d;
  const d2 = denyIfComplianceOnlyWriter(auth);
  if (d2) return d2;

  const { id } = await context.params;
  const existing = await prisma.countryDeployment.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!canPatchCountry(auth, existing)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const body = await readJsonObject(req);
  const data: Record<string, unknown> = {};

  if (typeof body.regionId === "string") data.regionId = body.regionId.trim();
  if (typeof body.name === "string") data.name = body.name.trim();
  if (typeof body.iso2 === "string") data.iso2 = body.iso2.trim().toUpperCase();
  if (typeof body.iso3 === "string") data.iso3 = body.iso3.trim().toUpperCase();
  if (typeof body.flagAssetKey === "string") data.flagAssetKey = body.flagAssetKey.trim();
  if (typeof body.countrySubdomain === "string") {
    data.countrySubdomain = body.countrySubdomain.trim().toLowerCase();
  }
  const population = parseIntOrNull(body.population);
  if (population !== undefined) data.population = population;
  if (typeof body.populationDisplay === "string") data.populationDisplay = body.populationDisplay.trim();
  if (typeof body.officialReferenceDomain === "string") {
    data.officialReferenceDomain = body.officialReferenceDomain.trim();
  }
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

  const updated = await prisma.countryDeployment.update({
    where: { id },
    data,
  });

  if (nextStatus && nextStatus !== existing.status) {
    await writeStatusHistory({
      targetType: StatusHistoryTargetType.COUNTRY,
      targetId: id,
      previousStatus: existing.status,
      nextStatus,
      reason: typeof body.statusChangeReason === "string" ? body.statusChangeReason : null,
    });
    notifyDeploymentStatusChanged({
      entityType: "CountryDeployment",
      entityId: id,
      previousStatus: existing.status,
      nextStatus,
    });
  }

  await writeAudit({
    entityType: "CountryDeployment",
    entityId: id,
    action: "PATCH",
    payload: body,
  });
  revalidateDeploymentsAfterMutation();

  return NextResponse.json({ country: updated });
}

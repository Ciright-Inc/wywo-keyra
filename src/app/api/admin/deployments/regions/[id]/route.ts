import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { readJsonObject } from "@/app/api/keyra/_routeHelpers";
import { revalidateDeploymentsAfterMutation, writeAudit } from "@/app/api/admin/deployments/_audit";
import { parseBoolean, parseIntOrNull } from "@/app/api/admin/deployments/_parse";
import { requireDeploymentAuth } from "@/lib/deployments/adminContext";
import {
  canPatchRegion,
  denyIfComplianceOnlyWriter,
  denyIfReadOnly,
} from "@/lib/deployments/adminAuthz";

type Params = { id: string };

export async function PATCH(req: Request, context: { params: Promise<Params> }) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const d = denyIfReadOnly(auth);
  if (d) return d;
  const d2 = denyIfComplianceOnlyWriter(auth);
  if (d2) return d2;

  const { id } = await context.params;
  const existing = await prisma.region.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!canPatchRegion(auth, id)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const body = await readJsonObject(req);
  const data: Record<string, unknown> = {};

  if (typeof body.continentCode === "string") data.continentCode = body.continentCode.trim();
  if (typeof body.subregionCode === "string") data.subregionCode = body.subregionCode.trim();
  if (typeof body.name === "string") data.name = body.name.trim();
  if (typeof body.slug === "string") data.slug = body.slug.trim().toLowerCase();
  if (typeof body.mapKey === "string") data.mapKey = body.mapKey.trim();
  const sortOrder = parseIntOrNull(body.sortOrder);
  if (sortOrder !== undefined) data.sortOrder = sortOrder;
  const isPublished = parseBoolean(body.isPublished);
  if (isPublished !== undefined) data.isPublished = isPublished;

  const updated = await prisma.region.update({
    where: { id },
    data,
  });

  await writeAudit({
    entityType: "Region",
    entityId: id,
    action: "PATCH",
    payload: body,
  });
  revalidateDeploymentsAfterMutation();

  return NextResponse.json({ region: updated });
}

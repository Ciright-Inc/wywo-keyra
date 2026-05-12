import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { readJsonObject } from "@/app/api/keyra/_routeHelpers";
import { revalidateDeploymentsAfterMutation, writeAudit } from "@/app/api/admin/deployments/_audit";
import { parseBoolean, parseIntOrNull } from "@/app/api/admin/deployments/_parse";
import { requireDeploymentAuth, regionWhereFromAuth } from "@/lib/deployments/adminContext";
import {
  canCreateRegion,
  denyIfComplianceOnlyWriter,
  denyIfReadOnly,
} from "@/lib/deployments/adminAuthz";

export async function GET(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const where = await regionWhereFromAuth(auth);
  const rows = await prisma.region.findMany({
    where: where ?? undefined,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return NextResponse.json({ regions: rows });
}

export async function POST(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const d = denyIfReadOnly(auth);
  if (d) return d;
  const d2 = denyIfComplianceOnlyWriter(auth);
  if (d2) return d2;
  if (!canCreateRegion(auth)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const body = await readJsonObject(req);
  const continentCode = typeof body.continentCode === "string" ? body.continentCode.trim() : "";
  const subregionCode = typeof body.subregionCode === "string" ? body.subregionCode.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";
  const mapKey = typeof body.mapKey === "string" ? body.mapKey.trim() : "";
  const sortOrder = parseIntOrNull(body.sortOrder) ?? 0;
  const isPublished = parseBoolean(body.isPublished) ?? false;

  if (!continentCode || !subregionCode || !name || !slug || !mapKey) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const created = await prisma.region.create({
    data: {
      continentCode,
      subregionCode,
      name,
      slug,
      mapKey,
      sortOrder,
      isPublished,
    },
  });

  await writeAudit({
    entityType: "Region",
    entityId: created.id,
    action: "CREATE",
    payload: { slug: created.slug },
  });
  revalidateDeploymentsAfterMutation();

  return NextResponse.json({ region: created }, { status: 201 });
}

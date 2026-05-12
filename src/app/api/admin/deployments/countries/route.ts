import { NextResponse } from "next/server";
import { StatusHistoryTargetType } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { readJsonObject } from "@/app/api/keyra/_routeHelpers";
import {
  revalidateDeploymentsAfterMutation,
  writeAudit,
  writeStatusHistory,
} from "@/app/api/admin/deployments/_audit";
import { parseBoolean, parseDeploymentStatus, parseIntOrNull } from "@/app/api/admin/deployments/_parse";
import { countryWhereFromAuth, requireDeploymentAuth } from "@/lib/deployments/adminContext";
import { canCreateCountry, denyIfComplianceOnlyWriter, denyIfReadOnly } from "@/lib/deployments/adminAuthz";

export async function GET(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;

  const url = new URL(req.url);
  const continent = url.searchParams.get("continent") ?? undefined;
  const regionId = url.searchParams.get("regionId") ?? undefined;
  const status = url.searchParams.get("status") ?? undefined;
  const q = url.searchParams.get("q")?.trim().toLowerCase() ?? "";

  const scoped = await countryWhereFromAuth(auth);
  const filters: Prisma.CountryDeploymentWhereInput = {
    ...(scoped ?? {}),
    ...(continent ? { region: { continentCode: continent } } : {}),
    ...(regionId ? { regionId } : {}),
    ...(status ? { status: status as never } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q } },
            { iso2: { contains: q } },
            { iso3: { contains: q } },
            { countrySubdomain: { contains: q } },
          ],
        }
      : {}),
  };

  const rows = await prisma.countryDeployment.findMany({
    where: filters,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { region: true },
  });

  return NextResponse.json({ countries: rows });
}

export async function POST(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const d = denyIfReadOnly(auth);
  if (d) return d;
  const d2 = denyIfComplianceOnlyWriter(auth);
  if (d2) return d2;

  const body = await readJsonObject(req);
  const regionId = typeof body.regionId === "string" ? body.regionId.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const iso2 = typeof body.iso2 === "string" ? body.iso2.trim().toUpperCase() : "";
  const iso3 = typeof body.iso3 === "string" ? body.iso3.trim().toUpperCase() : "";
  const flagAssetKey = typeof body.flagAssetKey === "string" ? body.flagAssetKey.trim() : "";
  const countrySubdomain =
    typeof body.countrySubdomain === "string" ? body.countrySubdomain.trim().toLowerCase() : "";
  const status = parseDeploymentStatus(body.status) ?? "IDENTIFIED";

  if (!regionId || !name || !iso2 || !iso3 || !flagAssetKey || !countrySubdomain) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  if (!canCreateCountry(auth, regionId)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const region = await prisma.region.findUnique({ where: { id: regionId } });
  if (!region) return NextResponse.json({ error: "Region not found." }, { status: 400 });

  const population = parseIntOrNull(body.population);
  const populationDisplay =
    typeof body.populationDisplay === "string" ? body.populationDisplay.trim() : null;
  const officialReferenceDomain =
    typeof body.officialReferenceDomain === "string"
      ? body.officialReferenceDomain.trim()
      : null;
  const statusNote = typeof body.statusNote === "string" ? body.statusNote.trim() : null;
  const sourceLabel = typeof body.sourceLabel === "string" ? body.sourceLabel.trim() : null;
  const sourceUrl = typeof body.sourceUrl === "string" ? body.sourceUrl.trim() : null;
  const sourceVerifiedAtRaw = body.sourceVerifiedAt;
  const sourceVerifiedAt =
    typeof sourceVerifiedAtRaw === "string" && sourceVerifiedAtRaw.trim().length
      ? new Date(sourceVerifiedAtRaw)
      : null;
  const sortOrder = parseIntOrNull(body.sortOrder) ?? 0;
  const isPublished = parseBoolean(body.isPublished) ?? false;

  const created = await prisma.countryDeployment.create({
    data: {
      regionId,
      name,
      iso2,
      iso3,
      flagAssetKey,
      population: population === undefined ? null : population,
      populationDisplay,
      countrySubdomain,
      officialReferenceDomain,
      status,
      statusNote,
      sourceLabel,
      sourceUrl,
      sourceVerifiedAt,
      sortOrder,
      isPublished,
    },
  });

  await writeStatusHistory({
    targetType: StatusHistoryTargetType.COUNTRY,
    targetId: created.id,
    previousStatus: null,
    nextStatus: status,
    reason: "Created",
  });

  await writeAudit({
    entityType: "CountryDeployment",
    entityId: created.id,
    action: "CREATE",
    payload: { iso2, countrySubdomain },
  });
  revalidateDeploymentsAfterMutation();

  return NextResponse.json({ country: created }, { status: 201 });
}

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
import { telcoSubdomainFromCountry } from "@/lib/deployments/subdomains";
import { requireDeploymentAuth, telcoWhereFromAuth } from "@/lib/deployments/adminContext";
import {
  canCreateTelco,
  denyIfComplianceOnlyWriter,
  denyIfReadOnly,
} from "@/lib/deployments/adminAuthz";

export async function GET(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;

  const url = new URL(req.url);
  const countryId = url.searchParams.get("countryId") ?? undefined;
  const status = url.searchParams.get("status") ?? undefined;
  const q = url.searchParams.get("q")?.trim().toLowerCase() ?? "";

  const scoped = await telcoWhereFromAuth(auth);
  const filters: Prisma.TelcoDeploymentWhereInput = {
    ...(scoped ?? {}),
    ...(countryId ? { countryId } : {}),
    ...(status ? { status: status as never } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q } },
            { slug: { contains: q } },
            { telcoSubdomain: { contains: q } },
          ],
        }
      : {}),
  };

  const rows = await prisma.telcoDeployment.findMany({
    where: filters,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { country: true },
  });

  return NextResponse.json({ telcos: rows });
}

export async function POST(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const d = denyIfReadOnly(auth);
  if (d) return d;
  const d2 = denyIfComplianceOnlyWriter(auth);
  if (d2) return d2;

  const body = await readJsonObject(req);
  const countryId = typeof body.countryId === "string" ? body.countryId.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";
  const status = parseDeploymentStatus(body.status) ?? "IDENTIFIED";

  if (!countryId || !name || !slug) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const country = await prisma.countryDeployment.findUnique({ where: { id: countryId } });
  if (!country) return NextResponse.json({ error: "Country not found." }, { status: 400 });

  if (!canCreateTelco(auth, country)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const telcoSubdomain =
    typeof body.telcoSubdomain === "string" && body.telcoSubdomain.trim().length
      ? body.telcoSubdomain.trim().toLowerCase()
      : telcoSubdomainFromCountry(country.countrySubdomain, slug);

  const subscribers = parseIntOrNull(body.subscribers);
  const subscribersDisplay =
    typeof body.subscribersDisplay === "string" ? body.subscribersDisplay.trim() : null;
  const officialDomain =
    typeof body.officialDomain === "string" ? body.officialDomain.trim() : null;
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

  const created = await prisma.telcoDeployment.create({
    data: {
      countryId,
      name,
      slug,
      subscribers: subscribers === undefined ? null : subscribers,
      subscribersDisplay,
      telcoSubdomain,
      officialDomain,
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
    targetType: StatusHistoryTargetType.TELCO,
    targetId: created.id,
    previousStatus: null,
    nextStatus: status,
    reason: "Created",
  });

  await writeAudit({
    entityType: "TelcoDeployment",
    entityId: created.id,
    action: "CREATE",
    payload: { slug, telcoSubdomain },
  });
  revalidateDeploymentsAfterMutation();

  return NextResponse.json({ telco: created }, { status: 201 });
}

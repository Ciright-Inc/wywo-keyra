import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { revalidateDeploymentsAfterMutation, writeAudit } from "@/app/api/admin/deployments/_audit";
import { parseBoolean, parseDeploymentStatus } from "@/app/api/admin/deployments/_parse";
import { countryWhereFromAuth, requireDeploymentAuth } from "@/lib/deployments/adminContext";
import { canPatchCountry, denyIfComplianceOnlyWriter, denyIfReadOnly } from "@/lib/deployments/adminAuthz";

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export async function GET(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;

  const scoped = await countryWhereFromAuth(auth);
  const where: Prisma.CountryDeploymentWhereInput = scoped ?? {};

  const rows = await prisma.countryDeployment.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { region: { select: { slug: true } } },
  });

  const header = [
    "id",
    "regionSlug",
    "name",
    "iso2",
    "iso3",
    "flagAssetKey",
    "population",
    "populationDisplay",
    "countrySubdomain",
    "officialReferenceDomain",
    "status",
    "statusNote",
    "sourceLabel",
    "sourceUrl",
    "sourceVerifiedAt",
    "sortOrder",
    "isPublished",
  ];

  const lines = [header.join(",")];
  for (const r of rows) {
    const sourceVerifiedAt = r.sourceVerifiedAt ? r.sourceVerifiedAt.toISOString() : "";
    lines.push(
      [
        csvEscape(r.id),
        csvEscape(r.region.slug),
        csvEscape(r.name),
        csvEscape(r.iso2),
        csvEscape(r.iso3),
        csvEscape(r.flagAssetKey),
        r.population === null || r.population === undefined ? "" : String(r.population),
        csvEscape(r.populationDisplay ?? ""),
        csvEscape(r.countrySubdomain),
        csvEscape(r.officialReferenceDomain ?? ""),
        csvEscape(r.status),
        csvEscape(r.statusNote ?? ""),
        csvEscape(r.sourceLabel ?? ""),
        csvEscape(r.sourceUrl ?? ""),
        csvEscape(sourceVerifiedAt),
        String(r.sortOrder),
        r.isPublished ? "true" : "false",
      ].join(","),
    );
  }

  return new NextResponse(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="countries.csv"',
    },
  });
}

export async function POST(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const d = denyIfReadOnly(auth);
  if (d) return d;
  const d2 = denyIfComplianceOnlyWriter(auth);
  if (d2) return d2;

  const rawText = await req.text();
  const lines = rawText.split(/\r?\n/).filter((l) => l.trim().length);
  if (lines.length < 2) {
    return NextResponse.json({ error: "CSV must include a header row and data." }, { status: 400 });
  }

  const header = lines[0].split(",").map((h) => h.trim());
  const idx = (name: string) => header.findIndex((h) => h.toLowerCase() === name.toLowerCase());

  const iRegionSlug = idx("regionSlug");
  const iIso2 = idx("iso2");
  if (iRegionSlug < 0 || iIso2 < 0) {
    return NextResponse.json({ error: "CSV must include regionSlug and iso2 columns." }, { status: 400 });
  }

  const regions = await prisma.region.findMany({ select: { id: true, slug: true } });
  const regionIdBySlug = new Map(regions.map((r) => [r.slug, r.id]));

  let updated = 0;
  for (const line of lines.slice(1)) {
    const cols = line.split(",");
    const regionSlug = cols[iRegionSlug]?.trim();
    const iso2 = cols[iIso2]?.trim().toUpperCase();
    if (!regionSlug || !iso2) continue;
    const regionId = regionIdBySlug.get(regionSlug);
    if (!regionId) continue;

    const country = await prisma.countryDeployment.findFirst({ where: { iso2 } });
    if (!country) continue;

    if (!canPatchCountry(auth, country)) continue;

    const data: Record<string, unknown> = { regionId };

    const set = (colName: string, key: string, transform?: (v: string) => unknown) => {
      const i = idx(colName);
      if (i < 0) return;
      const v = cols[i]?.trim();
      if (v === undefined) return;
      data[key] = transform ? transform(v) : v;
    };

    set("name", "name");
    set("iso3", "iso3", (v) => v.toUpperCase());
    set("flagAssetKey", "flagAssetKey");
    set("population", "population", (v) => (v ? Number.parseInt(v, 10) : null));
    set("populationDisplay", "populationDisplay");
    set("countrySubdomain", "countrySubdomain", (v) => v.toLowerCase());
    set("officialReferenceDomain", "officialReferenceDomain");
    set("status", "status", (v) => parseDeploymentStatus(v) ?? undefined);
    set("statusNote", "statusNote");
    set("sourceLabel", "sourceLabel");
    set("sourceUrl", "sourceUrl");
    set("sourceVerifiedAt", "sourceVerifiedAt", (v) => (v ? new Date(v) : null));
    set("sortOrder", "sortOrder", (v) => Number.parseInt(v, 10));
    const iPub = idx("isPublished");
    if (iPub >= 0) {
      const b = parseBoolean(cols[iPub]?.trim());
      if (b !== undefined) data.isPublished = b;
    }

    await prisma.countryDeployment.update({
      where: { id: country.id },
      data,
    });
    updated += 1;
  }

  await writeAudit({
    entityType: "CountryDeployment",
    entityId: "bulk",
    action: "CSV_IMPORT",
    payload: { rows: lines.length - 1, updated },
  });
  revalidateDeploymentsAfterMutation();

  return NextResponse.json({ ok: true, updated });
}

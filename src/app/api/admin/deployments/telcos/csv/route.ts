import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { revalidateDeploymentsAfterMutation, writeAudit } from "@/app/api/admin/deployments/_audit";
import { parseBoolean, parseDeploymentStatus, parseIntOrNull } from "@/app/api/admin/deployments/_parse";
import { requireDeploymentAuth, telcoWhereFromAuth } from "@/lib/deployments/adminContext";
import { canPatchTelco, denyIfComplianceOnlyWriter, denyIfReadOnly } from "@/lib/deployments/adminAuthz";

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export async function GET(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;

  const scoped = await telcoWhereFromAuth(auth);
  const where: Prisma.TelcoDeploymentWhereInput = scoped ?? {};

  const rows = await prisma.telcoDeployment.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { country: { select: { iso2: true } } },
  });

  const header = [
    "id",
    "countryIso2",
    "name",
    "slug",
    "subscribers",
    "subscribersDisplay",
    "telcoSubdomain",
    "officialDomain",
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
        csvEscape(r.country.iso2),
        csvEscape(r.name),
        csvEscape(r.slug),
        r.subscribers === null || r.subscribers === undefined ? "" : String(r.subscribers),
        csvEscape(r.subscribersDisplay ?? ""),
        csvEscape(r.telcoSubdomain),
        csvEscape(r.officialDomain ?? ""),
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
      "Content-Disposition": 'attachment; filename="telcos.csv"',
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

  const iCountryIso2 = idx("countryIso2");
  const iSlug = idx("slug");
  if (iCountryIso2 < 0 || iSlug < 0) {
    return NextResponse.json({ error: "CSV must include countryIso2 and slug columns." }, { status: 400 });
  }

  let updated = 0;
  for (const line of lines.slice(1)) {
    const cols = line.split(",");
    const countryIso2 = cols[iCountryIso2]?.trim().toUpperCase();
    const slug = cols[iSlug]?.trim().toLowerCase();
    if (!countryIso2 || !slug) continue;

    const country = await prisma.countryDeployment.findFirst({ where: { iso2: countryIso2 } });
    if (!country) continue;

    const telco = await prisma.telcoDeployment.findFirst({
      where: { countryId: country.id, slug },
      include: { country: true },
    });
    if (!telco) continue;

    if (!canPatchTelco(auth, telco, telco.country)) continue;

    const data: Record<string, unknown> = {};

    const set = (colName: string, key: string, transform?: (v: string) => unknown) => {
      const i = idx(colName);
      if (i < 0) return;
      const v = cols[i]?.trim();
      if (v === undefined) return;
      data[key] = transform ? transform(v) : v;
    };

    set("name", "name");
    set("telcoSubdomain", "telcoSubdomain", (v) => v.toLowerCase());
    set("officialDomain", "officialDomain");
    set("status", "status", (v) => parseDeploymentStatus(v) ?? undefined);
    set("statusNote", "statusNote");
    set("sourceLabel", "sourceLabel");
    set("sourceUrl", "sourceUrl");
    set("sourceVerifiedAt", "sourceVerifiedAt", (v) => (v ? new Date(v) : null));
    set("sortOrder", "sortOrder", (v) => Number.parseInt(v, 10));
    const iSub = idx("subscribers");
    if (iSub >= 0) {
      const raw = cols[iSub]?.trim();
      data.subscribers = raw ? parseIntOrNull(raw) : null;
    }
    set("subscribersDisplay", "subscribersDisplay");
    const iPub = idx("isPublished");
    if (iPub >= 0) {
      const b = parseBoolean(cols[iPub]?.trim());
      if (b !== undefined) data.isPublished = b;
    }

    if (Object.keys(data).length === 0) continue;

    await prisma.telcoDeployment.update({
      where: { id: telco.id },
      data,
    });
    updated += 1;
  }

  await writeAudit({
    entityType: "TelcoDeployment",
    entityId: "bulk",
    action: "CSV_IMPORT",
    payload: { rows: lines.length - 1, updated },
  });
  revalidateDeploymentsAfterMutation();

  return NextResponse.json({ ok: true, updated });
}

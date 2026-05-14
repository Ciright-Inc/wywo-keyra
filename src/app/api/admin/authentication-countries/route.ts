import { readJsonObject, rateLimitResponse } from "@/app/api/keyra/_routeHelpers";
import { writeAudit } from "@/app/api/admin/deployments/_audit";
import { requireGlobalFeedWrite } from "@/lib/authenticationFeed/adminGuard";
import { requireDeploymentAuth } from "@/lib/deployments/adminContext";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;

  const url = new URL(req.url);
  const region = url.searchParams.get("region")?.trim();
  const activeParam = url.searchParams.get("active");
  const q = url.searchParams.get("q")?.trim().toLowerCase() ?? "";
  const sort = url.searchParams.get("sort")?.trim().toLowerCase() ?? "priority";

  const orderBy =
    sort === "weight" || sort === "percentage"
      ? ([{ percentageWeight: "desc" as const }, { countryName: "asc" as const }] as const)
      : sort === "name" || sort === "country"
        ? ([{ countryName: "asc" as const }] as const)
        : ([{ displayPriority: "asc" as const }, { countryName: "asc" as const }] as const);

  const where = {
    ...(region ? { region } : {}),
    ...(activeParam === "true" ? { active: true } : {}),
    ...(activeParam === "false" ? { active: false } : {}),
    ...(q
      ? {
          OR: [
            { countryName: { contains: q, mode: "insensitive" as const } },
            { iso2: { contains: q, mode: "insensitive" as const } },
            { region: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const rows = await prisma.authenticationCountry.findMany({
    where,
    orderBy: [...orderBy],
  });

  return NextResponse.json({ countries: rows });
}

export async function POST(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const denied = requireGlobalFeedWrite(auth);
  if (denied) return denied;

  const limited = rateLimitResponse(req, "admin-auth-countries-post");
  if (limited) return limited;

  const body = await readJsonObject(req);
  const countryName = typeof body.countryName === "string" ? body.countryName.trim() : "";
  const iso2 = typeof body.iso2 === "string" ? body.iso2.trim().toUpperCase() : "";
  const region = typeof body.region === "string" ? body.region.trim() : "";
  const active = body.active === false ? false : true;
  const percentageWeight =
    typeof body.percentageWeight === "number" && Number.isFinite(body.percentageWeight)
      ? body.percentageWeight
      : 1;
  const displayPriority =
    typeof body.displayPriority === "number" && Number.isFinite(body.displayPriority)
      ? Math.floor(body.displayPriority)
      : 0;
  const notes = typeof body.notes === "string" ? body.notes.trim() : null;

  if (!countryName || iso2.length !== 2 || !region) {
    return NextResponse.json({ error: "countryName, iso2 (2 letters), and region are required." }, { status: 400 });
  }

  const dup = await prisma.authenticationCountry.findUnique({ where: { iso2 } });
  if (dup) {
    return NextResponse.json({ error: "A country with this ISO2 already exists." }, { status: 409 });
  }

  const created = await prisma.authenticationCountry.create({
    data: {
      countryName,
      iso2,
      region,
      active,
      percentageWeight,
      displayPriority,
      notes,
    },
  });

  await writeAudit({
    entityType: "AuthenticationCountry",
    entityId: created.id,
    action: "create",
    payload: {
      snapshot: {
        countryName: created.countryName,
        iso2: created.iso2,
        region: created.region,
        active: created.active,
        percentageWeight: created.percentageWeight,
        displayPriority: created.displayPriority,
        notes: created.notes,
      },
    },
  });

  return NextResponse.json({ country: created });
}

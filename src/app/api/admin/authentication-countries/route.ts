import type { Prisma } from "@prisma/client";
import { readJsonObject, rateLimitResponse } from "@/app/api/keyra/_routeHelpers";
import { writeAudit } from "@/app/api/admin/deployments/_audit";
import {
  DEFAULT_AUTH_COUNTRY_WEIGHT,
  validateCountryName,
  validatePercentageWeight,
} from "@/lib/authenticationFeed/countryPayload";
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
  const subRegion = url.searchParams.get("subRegion")?.trim();
  const activeParam = url.searchParams.get("active");
  const authEn = url.searchParams.get("authenticationEnabled");
  const weightMinRaw = url.searchParams.get("weightMin");
  const weightMaxRaw = url.searchParams.get("weightMax");
  const q = url.searchParams.get("q")?.trim().toLowerCase() ?? "";
  const sort = url.searchParams.get("sort")?.trim().toLowerCase() ?? "priority";

  const orderBy: Prisma.AuthenticationCountryOrderByWithRelationInput[] =
    sort === "weight" || sort === "percentage"
      ? [{ percentageWeight: "desc" }, { countryName: "asc" }]
      : sort === "name" || sort === "country"
        ? [{ countryName: "asc" }]
        : sort === "iso" || sort === "iso2"
          ? [{ iso2: "asc" }]
          : sort === "updated"
            ? [{ updatedAt: "desc" }]
            : [{ displayPriority: "asc" }, { countryName: "asc" }];

  const weightMin = weightMinRaw != null && weightMinRaw !== "" ? Number(weightMinRaw) : null;
  const weightMax = weightMaxRaw != null && weightMaxRaw !== "" ? Number(weightMaxRaw) : null;

  const where: Prisma.AuthenticationCountryWhereInput = {
    ...(region ? { region } : {}),
    ...(subRegion ? { subRegion } : {}),
    ...(activeParam === "true" ? { active: true } : {}),
    ...(activeParam === "false" ? { active: false } : {}),
    ...(authEn === "true" ? { authenticationEnabled: true } : {}),
    ...(authEn === "false" ? { authenticationEnabled: false } : {}),
    ...(q
      ? {
          OR: [
            { countryName: { contains: q, mode: "insensitive" } },
            { officialName: { contains: q, mode: "insensitive" } },
            { iso2: { contains: q, mode: "insensitive" } },
            { iso3: { contains: q, mode: "insensitive" } },
            { region: { contains: q, mode: "insensitive" } },
            { subRegion: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  if (weightMin != null && Number.isFinite(weightMin) && weightMax != null && Number.isFinite(weightMax)) {
    where.percentageWeight = { gte: weightMin, lte: weightMax };
  } else if (weightMin != null && Number.isFinite(weightMin)) {
    where.percentageWeight = { gte: weightMin };
  } else if (weightMax != null && Number.isFinite(weightMax)) {
    where.percentageWeight = { lte: weightMax };
  }

  const rows = await prisma.authenticationCountry.findMany({
    where,
    orderBy,
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
  const authenticationEnabled = body.authenticationEnabled === false ? false : true;
  const weightRaw =
    typeof body.percentageWeight === "number" && Number.isFinite(body.percentageWeight)
      ? body.percentageWeight
      : DEFAULT_AUTH_COUNTRY_WEIGHT;
  const wv = validatePercentageWeight(weightRaw);
  if (typeof wv === "object") return NextResponse.json({ error: wv.error }, { status: 400 });
  const percentageWeight = wv;
  const displayPriority =
    typeof body.displayPriority === "number" && Number.isFinite(body.displayPriority)
      ? Math.floor(body.displayPriority)
      : 0;
  const notes = typeof body.notes === "string" ? body.notes.trim() : null;
  const officialName = typeof body.officialName === "string" ? body.officialName.trim() || null : null;
  const iso3 =
    typeof body.iso3 === "string" && body.iso3.trim().length === 3 ? body.iso3.trim().toUpperCase() : null;
  const isoNumeric =
    typeof body.isoNumeric === "string" && body.isoNumeric.trim() ? body.isoNumeric.trim().slice(0, 3) : null;
  const subRegion = typeof body.subRegion === "string" ? body.subRegion.trim() || null : null;
  const capitalCity = typeof body.capitalCity === "string" ? body.capitalCity.trim() || null : null;
  const flagEmoji = typeof body.flagEmoji === "string" ? body.flagEmoji.trim().slice(0, 8) || null : null;
  const flagAssetPath = typeof body.flagAssetPath === "string" ? body.flagAssetPath.trim() || null : null;
  const phoneCountryCode =
    typeof body.phoneCountryCode === "string" ? body.phoneCountryCode.trim().slice(0, 32) || null : null;
  const currencyCode =
    typeof body.currencyCode === "string" ? body.currencyCode.trim().toUpperCase().slice(0, 3) || null : null;
  const currencyName = typeof body.currencyName === "string" ? body.currencyName.trim() || null : null;
  const primaryLanguage = typeof body.primaryLanguage === "string" ? body.primaryLanguage.trim() || null : null;

  const nameCheck = validateCountryName(countryName);
  if (nameCheck !== true) return NextResponse.json({ error: nameCheck.error }, { status: 400 });

  if (iso2.length !== 2 || !region) {
    return NextResponse.json({ error: "iso2 (2 letters) and region are required." }, { status: 400 });
  }

  const dup = await prisma.authenticationCountry.findUnique({ where: { iso2 } });
  if (dup) {
    return NextResponse.json({ error: "A country with this ISO2 already exists." }, { status: 409 });
  }
  if (iso3) {
    const dup3 = await prisma.authenticationCountry.findUnique({ where: { iso3 } });
    if (dup3) return NextResponse.json({ error: "A country with this ISO3 already exists." }, { status: 409 });
  }

  const created = await prisma.authenticationCountry.create({
    data: {
      countryName,
      officialName,
      iso2,
      iso3,
      isoNumeric,
      region,
      subRegion,
      capitalCity,
      flagEmoji,
      flagAssetPath,
      phoneCountryCode,
      currencyCode,
      currencyName,
      primaryLanguage,
      active,
      authenticationEnabled,
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
      snapshot: created,
    },
  });

  return NextResponse.json({ country: created });
}

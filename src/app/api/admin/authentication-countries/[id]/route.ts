import { readJsonObject, rateLimitResponse } from "@/app/api/keyra/_routeHelpers";
import { writeAudit } from "@/app/api/admin/deployments/_audit";
import { validateCountryName, validatePercentageWeight } from "@/lib/authenticationFeed/countryPayload";
import { requireGlobalFeedWrite } from "@/lib/authenticationFeed/adminGuard";
import { requireDeploymentAuth } from "@/lib/deployments/adminContext";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Ctx) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;

  const { id } = await ctx.params;
  const row = await prisma.authenticationCountry.findUnique({ where: { id } });
  if (!row) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json({ country: row });
}

export async function PATCH(req: Request, ctx: Ctx) {
  return PUT(req, ctx);
}

export async function PUT(req: Request, ctx: Ctx) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const denied = requireGlobalFeedWrite(auth);
  if (denied) return denied;

  const limited = rateLimitResponse(req, "admin-auth-countries-put");
  if (limited) return limited;

  const { id } = await ctx.params;
  const existing = await prisma.authenticationCountry.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const body = await readJsonObject(req);
  const data: Record<string, unknown> = {};

  if (typeof body.countryName === "string") {
    const v = validateCountryName(body.countryName);
    if (v !== true) return NextResponse.json({ error: v.error }, { status: 400 });
    data.countryName = body.countryName.trim();
  }
  if (typeof body.iso2 === "string") {
    const iso2 = body.iso2.trim().toUpperCase();
    if (iso2.length !== 2) {
      return NextResponse.json({ error: "iso2 must be two letters." }, { status: 400 });
    }
    if (iso2 !== existing.iso2) {
      const clash = await prisma.authenticationCountry.findUnique({ where: { iso2 } });
      if (clash) return NextResponse.json({ error: "ISO2 already in use." }, { status: 409 });
    }
    data.iso2 = iso2;
  }
  if (typeof body.officialName === "string") data.officialName = body.officialName.trim() || null;
  if (body.iso3 === null) data.iso3 = null;
  else if (typeof body.iso3 === "string") {
    const t = body.iso3.trim().toUpperCase();
    if (t.length === 0) data.iso3 = null;
    else {
      if (t.length !== 3) {
        return NextResponse.json({ error: "iso3 must be three letters when provided." }, { status: 400 });
      }
      if (t !== (existing.iso3 ?? "")) {
        const clash3 = await prisma.authenticationCountry.findUnique({ where: { iso3: t } });
        if (clash3) return NextResponse.json({ error: "ISO3 already in use." }, { status: 409 });
      }
      data.iso3 = t;
    }
  }
  if (typeof body.isoNumeric === "string") data.isoNumeric = body.isoNumeric.trim().slice(0, 3) || null;
  if (typeof body.region === "string") data.region = body.region.trim();
  if (typeof body.subRegion === "string") data.subRegion = body.subRegion.trim() || null;
  if (typeof body.capitalCity === "string") data.capitalCity = body.capitalCity.trim() || null;
  if (typeof body.flagEmoji === "string") data.flagEmoji = body.flagEmoji.trim().slice(0, 8) || null;
  if (typeof body.flagAssetPath === "string") data.flagAssetPath = body.flagAssetPath.trim() || null;
  if (typeof body.phoneCountryCode === "string") data.phoneCountryCode = body.phoneCountryCode.trim().slice(0, 32) || null;
  if (typeof body.currencyCode === "string") data.currencyCode = body.currencyCode.trim().toUpperCase().slice(0, 3) || null;
  if (typeof body.currencyName === "string") data.currencyName = body.currencyName.trim() || null;
  if (typeof body.primaryLanguage === "string") data.primaryLanguage = body.primaryLanguage.trim() || null;
  if (typeof body.active === "boolean") data.active = body.active;
  if (typeof body.authenticationEnabled === "boolean") data.authenticationEnabled = body.authenticationEnabled;
  if (typeof body.percentageWeight === "number" && Number.isFinite(body.percentageWeight)) {
    const wv = validatePercentageWeight(body.percentageWeight);
    if (typeof wv === "object") return NextResponse.json({ error: wv.error }, { status: 400 });
    data.percentageWeight = wv;
  }
  if (typeof body.displayPriority === "number" && Number.isFinite(body.displayPriority)) {
    data.displayPriority = Math.floor(body.displayPriority);
  }
  if (typeof body.notes === "string") data.notes = body.notes.trim() || null;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields to update." }, { status: 400 });
  }

  const updated = await prisma.authenticationCountry.update({
    where: { id },
    data: data as never,
  });

  await writeAudit({
    entityType: "AuthenticationCountry",
    entityId: id,
    action: "update",
    payload: { before: existing, patch: data },
  });

  return NextResponse.json({ country: updated });
}

export async function DELETE(req: Request, ctx: Ctx) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const denied = requireGlobalFeedWrite(auth);
  if (denied) return denied;

  const { id } = await ctx.params;
  const existing = await prisma.authenticationCountry.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  await prisma.authenticationCountry.delete({ where: { id } });
  await writeAudit({
    entityType: "AuthenticationCountry",
    entityId: id,
    action: "delete",
    payload: { snapshot: existing },
  });

  return NextResponse.json({ ok: true });
}

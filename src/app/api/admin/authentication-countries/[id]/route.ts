import { readJsonObject, rateLimitResponse } from "@/app/api/keyra/_routeHelpers";
import { writeAudit } from "@/app/api/admin/deployments/_audit";
import { requireGlobalFeedWrite } from "@/lib/authenticationFeed/adminGuard";
import { requireDeploymentAuth } from "@/lib/deployments/adminContext";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

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

  if (typeof body.countryName === "string") data.countryName = body.countryName.trim();
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
  if (typeof body.region === "string") data.region = body.region.trim();
  if (typeof body.active === "boolean") data.active = body.active;
  if (typeof body.percentageWeight === "number" && Number.isFinite(body.percentageWeight)) {
    data.percentageWeight = body.percentageWeight;
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

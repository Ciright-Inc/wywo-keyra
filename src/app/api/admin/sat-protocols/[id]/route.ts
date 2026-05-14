import { readJsonObject, rateLimitResponse } from "@/app/api/keyra/_routeHelpers";
import { writeAudit } from "@/app/api/admin/deployments/_audit";
import { requireGlobalFeedWrite } from "@/lib/authenticationFeed/adminGuard";
import { requireDeploymentAuth } from "@/lib/deployments/adminContext";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function validateHomeRoaming(home: number, roam: number): string | null {
  const t = home + roam;
  if (Math.abs(t - 100) > 0.1) {
    return "Home percentage + roaming percentage must equal 100.";
  }
  return null;
}

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, ctx: Ctx) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const denied = requireGlobalFeedWrite(auth);
  if (denied) return denied;

  const limited = rateLimitResponse(req, "admin-sat-protocols-put");
  if (limited) return limited;

  const { id } = await ctx.params;
  const existing = await prisma.satProtocol.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const body = await readJsonObject(req);
  const data: Record<string, unknown> = {};

  if (typeof body.protocolName === "string") data.protocolName = body.protocolName.trim();
  if (typeof body.protocolCode === "string") {
    const code = body.protocolCode.trim().toUpperCase();
    if (code !== existing.protocolCode) {
      const clash = await prisma.satProtocol.findUnique({ where: { protocolCode: code } });
      if (clash) return NextResponse.json({ error: "Protocol code already in use." }, { status: 409 });
    }
    data.protocolCode = code;
  }
  if (typeof body.protocolCategory === "string") data.protocolCategory = body.protocolCategory.trim();
  if (typeof body.active === "boolean") data.active = body.active;
  if (typeof body.percentageWeight === "number" && Number.isFinite(body.percentageWeight)) {
    data.percentageWeight = body.percentageWeight;
  }
  if (typeof body.protocolMemo === "string") data.protocolMemo = body.protocolMemo;
  if (typeof body.protocolUrlEnabled === "boolean") data.protocolUrlEnabled = body.protocolUrlEnabled;
  if (typeof body.protocolUrl === "string") data.protocolUrl = body.protocolUrl.trim() || null;
  if (typeof body.allowProtocolLink === "boolean") data.allowProtocolLink = body.allowProtocolLink;
  if (typeof body.homePercentage === "number" && Number.isFinite(body.homePercentage)) {
    data.homePercentage = body.homePercentage;
  }
  if (typeof body.roamingPercentage === "number" && Number.isFinite(body.roamingPercentage)) {
    data.roamingPercentage = body.roamingPercentage;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields to update." }, { status: 400 });
  }

  const nextHome = (data.homePercentage as number | undefined) ?? existing.homePercentage;
  const nextRoam = (data.roamingPercentage as number | undefined) ?? existing.roamingPercentage;
  const hrErr = validateHomeRoaming(nextHome, nextRoam);
  if (hrErr) return NextResponse.json({ error: hrErr }, { status: 400 });

  const updated = await prisma.satProtocol.update({
    where: { id },
    data: data as never,
  });

  await writeAudit({
    entityType: "SatProtocol",
    entityId: id,
    action: "update",
    payload: { before: existing, patch: data },
  });

  return NextResponse.json({ protocol: updated });
}

export async function DELETE(req: Request, ctx: Ctx) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const denied = requireGlobalFeedWrite(auth);
  if (denied) return denied;

  const { id } = await ctx.params;
  const existing = await prisma.satProtocol.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

  await prisma.satProtocol.delete({ where: { id } });
  await writeAudit({
    entityType: "SatProtocol",
    entityId: id,
    action: "delete",
    payload: { snapshot: existing },
  });

  return NextResponse.json({ ok: true });
}

import { readJsonObject, rateLimitResponse } from "@/app/api/keyra/_routeHelpers";
import { writeAudit } from "@/app/api/admin/deployments/_audit";
import { requireGlobalFeedWrite } from "@/lib/authenticationFeed/adminGuard";
import { requireDeploymentAuth } from "@/lib/deployments/adminContext";
import prisma from "@/lib/prisma";
import { validateHomeRoaming } from "@/lib/satProtocol/validateHomeRoaming";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Ctx) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;

  const { id } = await ctx.params;
  const row = await prisma.satProtocol.findUnique({ where: { id } });
  if (!row) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ protocol: row });
}

function optBool(v: unknown): boolean | undefined {
  return typeof v === "boolean" ? v : undefined;
}

function optInt(v: unknown): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? Math.trunc(v) : undefined;
}

function optFloat(v: unknown): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

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

  if ("protocolSlug" in body) {
    if (body.protocolSlug === null) {
      data.protocolSlug = null;
    } else if (typeof body.protocolSlug === "string") {
      const s = body.protocolSlug.trim().toLowerCase().replace(/\s+/g, "-");
      data.protocolSlug = s.length ? s : null;
      if (typeof data.protocolSlug === "string") {
        const clash = await prisma.satProtocol.findFirst({
          where: { protocolSlug: data.protocolSlug, NOT: { id } },
        });
        if (clash) return NextResponse.json({ error: "Protocol slug already in use." }, { status: 409 });
      }
    }
  }

  if ("shortDescription" in body) {
    if (body.shortDescription === null) data.shortDescription = null;
    else if (typeof body.shortDescription === "string") data.shortDescription = body.shortDescription.trim() || null;
  }
  if ("longDescription" in body) {
    if (body.longDescription === null) data.longDescription = null;
    else if (typeof body.longDescription === "string") data.longDescription = body.longDescription.trim() || null;
  }
  if ("securityClassification" in body) {
    if (body.securityClassification === null) data.securityClassification = "STANDARD";
    else if (typeof body.securityClassification === "string") {
      const t = body.securityClassification.trim();
      data.securityClassification = t.length ? t : "STANDARD";
    }
  }

  if (optBool(body.flagEnterprise) !== undefined) data.flagEnterprise = body.flagEnterprise;
  if (optBool(body.flagGovernment) !== undefined) data.flagGovernment = body.flagGovernment;
  if (optBool(body.flagTelco) !== undefined) data.flagTelco = body.flagTelco;
  if (optBool(body.flagConsumer) !== undefined) data.flagConsumer = body.flagConsumer;
  if (optBool(body.flagAiAgent) !== undefined) data.flagAiAgent = body.flagAiAgent;
  if (optInt(body.displayOrder) !== undefined) data.displayOrder = body.displayOrder;

  if ("iconKey" in body) {
    if (body.iconKey === null) data.iconKey = null;
    else if (typeof body.iconKey === "string") data.iconKey = body.iconKey.trim() || null;
  }
  if ("colorTheme" in body) {
    if (body.colorTheme === null) data.colorTheme = null;
    else if (typeof body.colorTheme === "string") data.colorTheme = body.colorTheme.trim() || null;
  }

  if (optInt(body.trustLevel) !== undefined) data.trustLevel = body.trustLevel;
  if (optInt(body.riskReductionScore) !== undefined) data.riskReductionScore = body.riskReductionScore;
  if (optBool(body.globalAvailability) !== undefined) data.globalAvailability = body.globalAvailability;
  if (optBool(body.apiReady) !== undefined) data.apiReady = body.apiReady;
  if (optBool(body.auditRequired) !== undefined) data.auditRequired = body.auditRequired;
  if (optBool(body.consentRequired) !== undefined) data.consentRequired = body.consentRequired;
  if (optBool(body.zeroKnowledgeCompatible) !== undefined) data.zeroKnowledgeCompatible = body.zeroKnowledgeCompatible;
  if (optBool(body.simOrEsimRequired) !== undefined) data.simOrEsimRequired = body.simOrEsimRequired;
  if (optBool(body.deviceBindingRequired) !== undefined) data.deviceBindingRequired = body.deviceBindingRequired;
  if (optBool(body.createdBySystem) !== undefined) data.createdBySystem = body.createdBySystem;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields to update." }, { status: 400 });
  }

  const nextHome = (optFloat(data.homePercentage) as number | undefined) ?? existing.homePercentage;
  const nextRoam = (optFloat(data.roamingPercentage) as number | undefined) ?? existing.roamingPercentage;
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

/** Partial update — same field rules as PUT. */
export async function PATCH(req: Request, ctx: Ctx) {
  return PUT(req, ctx);
}

export async function DELETE(req: Request, ctx: Ctx) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const denied = requireGlobalFeedWrite(auth);
  if (denied) return denied;

  const limited = rateLimitResponse(req, "admin-sat-protocols-delete");
  if (limited) return limited;

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

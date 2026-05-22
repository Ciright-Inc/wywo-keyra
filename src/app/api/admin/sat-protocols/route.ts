import { readJsonObject, rateLimitResponse } from "@/app/api/keyra/_routeHelpers";
import { writeAudit } from "@/app/api/admin/deployments/_audit";
import { requireGlobalFeedWrite } from "@/lib/authenticationFeed/adminGuard";
import {
  listSatProtocolsForAdmin,
  parseSatProtocolsSearchParams,
} from "@/lib/authenticationFeed/adminListQueries";
import { requireDeploymentAuth } from "@/lib/deployments/adminContext";
import prisma from "@/lib/prisma";
import { SAT_PROTOCOL_DEFAULT_HOME, SAT_PROTOCOL_DEFAULT_ROAMING, SAT_PROTOCOL_DEFAULT_WEIGHT } from "@/lib/satProtocol/registry";
import { validateHomeRoaming } from "@/lib/satProtocol/validateHomeRoaming";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;

  const params = parseSatProtocolsSearchParams(new URL(req.url).searchParams);
  const rows = await listSatProtocolsForAdmin(params);

  return NextResponse.json({ protocols: rows });
}

function optString(v: unknown): string | undefined {
  return typeof v === "string" ? v.trim() : undefined;
}

function optBool(v: unknown): boolean | undefined {
  return typeof v === "boolean" ? v : undefined;
}

function optInt(v: unknown): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? Math.trunc(v) : undefined;
}

export async function POST(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const denied = requireGlobalFeedWrite(auth);
  if (denied) return denied;

  const limited = rateLimitResponse(req, "admin-sat-protocols-post");
  if (limited) return limited;

  const body = await readJsonObject(req);
  const protocolName = typeof body.protocolName === "string" ? body.protocolName.trim() : "";
  const protocolCode = typeof body.protocolCode === "string" ? body.protocolCode.trim().toUpperCase() : "";
  const protocolCategory = typeof body.protocolCategory === "string" ? body.protocolCategory.trim() : "";
  const active = body.active === false ? false : true;
  const percentageWeight =
    typeof body.percentageWeight === "number" && Number.isFinite(body.percentageWeight)
      ? body.percentageWeight
      : SAT_PROTOCOL_DEFAULT_WEIGHT;
  const protocolMemo = typeof body.protocolMemo === "string" ? body.protocolMemo : "";
  const protocolUrlEnabled = body.protocolUrlEnabled === true;
  const protocolUrl = typeof body.protocolUrl === "string" ? body.protocolUrl.trim() : null;
  const allowProtocolLink = body.allowProtocolLink === true;
  const homePercentage =
    typeof body.homePercentage === "number" && Number.isFinite(body.homePercentage)
      ? body.homePercentage
      : SAT_PROTOCOL_DEFAULT_HOME;
  const roamingPercentage =
    typeof body.roamingPercentage === "number" && Number.isFinite(body.roamingPercentage)
      ? body.roamingPercentage
      : SAT_PROTOCOL_DEFAULT_ROAMING;

  if (!protocolName || !protocolCode || !protocolCategory) {
    return NextResponse.json({ error: "protocolName, protocolCode, and protocolCategory are required." }, { status: 400 });
  }

  const hrErr = validateHomeRoaming(homePercentage, roamingPercentage);
  if (hrErr) return NextResponse.json({ error: hrErr }, { status: 400 });

  const dup = await prisma.satProtocol.findUnique({ where: { protocolCode } });
  if (dup) {
    return NextResponse.json({ error: "Protocol code already exists." }, { status: 409 });
  }

  const slugRaw = optString(body.protocolSlug)?.toLowerCase().replace(/\s+/g, "-");
  if (slugRaw) {
    const slugClash = await prisma.satProtocol.findUnique({ where: { protocolSlug: slugRaw } });
    if (slugClash) return NextResponse.json({ error: "Protocol slug already in use." }, { status: 409 });
  }

  const created = await prisma.satProtocol.create({
    data: {
      protocolName,
      protocolCode,
      protocolSlug: slugRaw?.length ? slugRaw : null,
      protocolCategory,
      active,
      percentageWeight,
      protocolMemo,
      protocolUrlEnabled,
      protocolUrl: protocolUrl?.length ? protocolUrl : null,
      allowProtocolLink,
      homePercentage,
      roamingPercentage,
      shortDescription: optString(body.shortDescription) ?? null,
      longDescription: optString(body.longDescription) ?? null,
      securityClassification: optString(body.securityClassification) ?? "STANDARD",
      flagEnterprise: optBool(body.flagEnterprise) ?? true,
      flagGovernment: optBool(body.flagGovernment) ?? true,
      flagTelco: optBool(body.flagTelco) ?? true,
      flagConsumer: optBool(body.flagConsumer) ?? true,
      flagAiAgent: optBool(body.flagAiAgent) ?? true,
      displayOrder: optInt(body.displayOrder) ?? 0,
      iconKey: optString(body.iconKey) ?? null,
      colorTheme: optString(body.colorTheme) ?? null,
      trustLevel: optInt(body.trustLevel) ?? 4,
      riskReductionScore: optInt(body.riskReductionScore) ?? 0,
      globalAvailability: optBool(body.globalAvailability) ?? true,
      apiReady: optBool(body.apiReady) ?? true,
      auditRequired: optBool(body.auditRequired) ?? true,
      consentRequired: optBool(body.consentRequired) ?? true,
      zeroKnowledgeCompatible: optBool(body.zeroKnowledgeCompatible) ?? false,
      simOrEsimRequired: optBool(body.simOrEsimRequired) ?? false,
      deviceBindingRequired: optBool(body.deviceBindingRequired) ?? false,
      createdBySystem: false,
    },
  });

  await writeAudit({
    entityType: "SatProtocol",
    entityId: created.id,
    action: "create",
    payload: { snapshot: created },
  });

  return NextResponse.json({ protocol: created });
}

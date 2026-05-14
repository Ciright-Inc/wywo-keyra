import { rateLimitResponse } from "@/app/api/keyra/_routeHelpers";
import prisma from "@/lib/prisma";
import { isPostgresDatabaseUrlConfigured } from "@/lib/postgresEnv";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ protocolCode: string }> };

export async function GET(req: Request, ctx: Ctx) {
  const limited = rateLimitResponse(req, "keyra-sat-protocol-public");
  if (limited) return limited;

  if (!isPostgresDatabaseUrlConfigured()) {
    return NextResponse.json({ error: "Unavailable." }, { status: 503 });
  }

  const { protocolCode } = await ctx.params;
  const code = decodeURIComponent(protocolCode).trim().toUpperCase();
  if (!code) {
    return NextResponse.json({ error: "Invalid protocol code." }, { status: 400 });
  }

  const p = await prisma.satProtocol.findFirst({
    where: { protocolCode: code, active: true },
  });
  if (!p) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return NextResponse.json(
    {
      protocolName: p.protocolName,
      protocolCode: p.protocolCode,
      protocolSlug: p.protocolSlug,
      protocolCategory: p.protocolCategory,
      shortDescription: p.shortDescription,
      longDescription: p.longDescription,
      protocolMemo: p.protocolMemo,
      protocolUrlEnabled: p.protocolUrlEnabled,
      protocolUrl: p.protocolUrlEnabled ? p.protocolUrl : null,
      allowProtocolLink: p.allowProtocolLink,
      homePercentage: p.homePercentage,
      roamingPercentage: p.roamingPercentage,
      securityClassification: p.securityClassification,
      trustLevel: p.trustLevel,
      riskReductionScore: p.riskReductionScore,
      iconKey: p.iconKey,
      colorTheme: p.colorTheme,
      flagEnterprise: p.flagEnterprise,
      flagGovernment: p.flagGovernment,
      flagTelco: p.flagTelco,
      flagConsumer: p.flagConsumer,
      flagAiAgent: p.flagAiAgent,
      globalAvailability: p.globalAvailability,
      apiReady: p.apiReady,
      auditRequired: p.auditRequired,
      consentRequired: p.consentRequired,
      zeroKnowledgeCompatible: p.zeroKnowledgeCompatible,
      simOrEsimRequired: p.simOrEsimRequired,
      deviceBindingRequired: p.deviceBindingRequired,
      active: p.active,
      displayOrder: p.displayOrder,
    },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } },
  );
}

/**
 * Upserts the canonical SAT protocol master registry into `SatProtocol`.
 * Preserves operator-tuned fields on existing rows: active, percentageWeight, home/roam, URL flags/URL, allowProtocolLink.
 */
import type { Prisma, PrismaClient } from "@prisma/client";
import {
  SAT_PROTOCOL_DEFAULT_HOME,
  SAT_PROTOCOL_DEFAULT_ROAMING,
  SAT_PROTOCOL_DEFAULT_WEIGHT,
  SAT_PROTOCOL_REGISTRY,
} from "../src/lib/satProtocol/registry";

export async function seedSatProtocolRegistry(db: PrismaClient): Promise<void> {
  for (const e of SAT_PROTOCOL_REGISTRY) {
    const existing = await db.satProtocol.findUnique({ where: { protocolCode: e.protocolCode } });

    const canonical: Prisma.SatProtocolUncheckedCreateInput = {
      protocolName: e.protocolName,
      protocolCode: e.protocolCode,
      protocolSlug: e.protocolSlug,
      protocolCategory: e.protocolCategory,
      shortDescription: e.shortDescription,
      longDescription: e.longDescription,
      securityClassification: e.securityClassification,
      trustLevel: e.trustLevel,
      riskReductionScore: e.riskReductionScore,
      iconKey: e.iconKey,
      colorTheme: e.colorTheme,
      flagEnterprise: e.flagEnterprise,
      flagGovernment: e.flagGovernment,
      flagTelco: e.flagTelco,
      flagConsumer: e.flagConsumer,
      flagAiAgent: e.flagAiAgent,
      globalAvailability: e.globalAvailability,
      apiReady: e.apiReady,
      auditRequired: e.auditRequired,
      consentRequired: e.consentRequired,
      zeroKnowledgeCompatible: e.zeroKnowledgeCompatible,
      simOrEsimRequired: e.simOrEsimRequired,
      deviceBindingRequired: e.deviceBindingRequired,
      displayOrder: e.displayOrder,
      protocolMemo: e.shortDescription,
      createdBySystem: true,
      active: true,
      percentageWeight: SAT_PROTOCOL_DEFAULT_WEIGHT,
      homePercentage: SAT_PROTOCOL_DEFAULT_HOME,
      roamingPercentage: SAT_PROTOCOL_DEFAULT_ROAMING,
      protocolUrlEnabled: true,
      protocolUrl: "https://sat-core.com/applications",
      allowProtocolLink: false,
    };

    if (!existing) {
      await db.satProtocol.create({ data: canonical });
      continue;
    }

    await db.satProtocol.update({
      where: { protocolCode: e.protocolCode },
      data: {
        protocolName: e.protocolName,
        protocolSlug: e.protocolSlug,
        protocolCategory: e.protocolCategory,
        shortDescription: e.shortDescription,
        longDescription: e.longDescription,
        securityClassification: e.securityClassification,
        trustLevel: e.trustLevel,
        riskReductionScore: e.riskReductionScore,
        iconKey: e.iconKey,
        colorTheme: e.colorTheme,
        flagEnterprise: e.flagEnterprise,
        flagGovernment: e.flagGovernment,
        flagTelco: e.flagTelco,
        flagConsumer: e.flagConsumer,
        flagAiAgent: e.flagAiAgent,
        globalAvailability: e.globalAvailability,
        apiReady: e.apiReady,
        auditRequired: e.auditRequired,
        consentRequired: e.consentRequired,
        zeroKnowledgeCompatible: e.zeroKnowledgeCompatible,
        simOrEsimRequired: e.simOrEsimRequired,
        deviceBindingRequired: e.deviceBindingRequired,
        displayOrder: e.displayOrder,
        protocolMemo: existing.protocolMemo?.trim() ? existing.protocolMemo : e.shortDescription,
        createdBySystem: true,
      },
    });
  }

  console.log(`SAT protocol registry seed: ${SAT_PROTOCOL_REGISTRY.length} protocols upserted.`);
}

async function main() {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  try {
    await seedSatProtocolRegistry(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

const runStandalone =
  typeof process !== "undefined" && process.argv[1]?.includes("seedSatProtocolRegistry");
if (runStandalone) {
  void main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

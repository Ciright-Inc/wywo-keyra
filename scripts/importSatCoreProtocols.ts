/**
 * Upsert SAT protocol rows from curated JSON (aligned with sat-core.com/applications reference).
 * Run: `npx tsx scripts/importSatCoreProtocols.ts`
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Row = {
  protocolName: string;
  protocolCode: string;
  protocolCategory: string;
  percentageWeight: number;
  protocolMemo: string;
  protocolUrlEnabled: boolean;
  protocolUrl: string | null;
  allowProtocolLink: boolean;
  homePercentage: number;
  roamingPercentage: number;
};

async function main() {
  const p = join(process.cwd(), "prisma", "data", "sat-core-protocol-import.json");
  const rows = JSON.parse(readFileSync(p, "utf8")) as Row[];

  for (const r of rows) {
    await prisma.satProtocol.upsert({
      where: { protocolCode: r.protocolCode },
      create: {
        protocolName: r.protocolName,
        protocolCode: r.protocolCode,
        protocolCategory: r.protocolCategory,
        active: true,
        percentageWeight: r.percentageWeight,
        protocolMemo: r.protocolMemo,
        protocolUrlEnabled: r.protocolUrlEnabled,
        protocolUrl: r.protocolUrl,
        allowProtocolLink: r.allowProtocolLink,
        homePercentage: r.homePercentage,
        roamingPercentage: r.roamingPercentage,
      },
      update: {
        protocolName: r.protocolName,
        protocolCategory: r.protocolCategory,
        percentageWeight: r.percentageWeight,
        protocolMemo: r.protocolMemo,
        protocolUrlEnabled: r.protocolUrlEnabled,
        protocolUrl: r.protocolUrl,
        allowProtocolLink: r.allowProtocolLink,
        homePercentage: r.homePercentage,
        roamingPercentage: r.roamingPercentage,
      },
    });
  }

  console.log(`[import-sat-core] Upserted ${rows.length} protocols from JSON.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

/**
 * Seed authentication feed tables (countries + SAT protocols + default settings).
 * Run from Keyra root: `npx tsx prisma/seedAuthenticationFeed.ts`
 * Or invoked from `prisma/seed.ts` after deployment seed.
 */
import { PrismaClient } from "@prisma/client";

const countries = [
  { countryName: "United States", iso2: "US", region: "North America", weight: 22, priority: 10 },
  { countryName: "Ireland", iso2: "IE", region: "Europe", weight: 8, priority: 20 },
  { countryName: "Germany", iso2: "DE", region: "Europe", weight: 10, priority: 18 },
  { countryName: "France", iso2: "FR", region: "Europe", weight: 9, priority: 18 },
  { countryName: "United Kingdom", iso2: "GB", region: "Europe", weight: 9, priority: 18 },
  { countryName: "Brazil", iso2: "BR", region: "Latin America", weight: 10, priority: 14 },
  { countryName: "Mexico", iso2: "MX", region: "Latin America", weight: 8, priority: 14 },
  { countryName: "Japan", iso2: "JP", region: "Asia", weight: 9, priority: 12 },
  { countryName: "India", iso2: "IN", region: "Asia", weight: 10, priority: 12 },
  { countryName: "South Africa", iso2: "ZA", region: "Africa", weight: 4, priority: 30 },
  { countryName: "Australia", iso2: "AU", region: "Oceania", weight: 3, priority: 40 },
  { countryName: "United Arab Emirates", iso2: "AE", region: "Middle East", weight: 3, priority: 35 },
  { countryName: "Russia", iso2: "RU", region: "Europe", weight: 0.8, priority: 90 },
  { countryName: "China", iso2: "CN", region: "Asia", weight: 0.8, priority: 91 },
];

const protocols = [
  {
    protocolName: "SAT Subscriber ID",
    protocolCode: "SAT-ID",
    category: "Identity",
    weight: 28,
    memo: "Hardware-bound subscriber identification used in SAT-MFA flows.",
    home: 55,
    roam: 45,
  },
  {
    protocolName: "SAT Subscriber Signature",
    protocolCode: "SAT-SIG",
    category: "Signing",
    weight: 32,
    memo: "Subscriber-side cryptographic signing for high-assurance transactions.",
    home: 52,
    roam: 48,
  },
  {
    protocolName: "SAT Multi-Factor",
    protocolCode: "SAT-MFA",
    category: "Authentication",
    weight: 40,
    memo: "Layered SAT verification combining device, network, and policy signals.",
    home: 58,
    roam: 42,
  },
];

export async function seedAuthenticationFeed(db: PrismaClient): Promise<void> {
  await db.authenticationFeedSetting.upsert({
    where: { id: "default" },
    create: { id: "default" },
    update: {},
  });

  for (const c of countries) {
    await db.authenticationCountry.upsert({
      where: { iso2: c.iso2 },
      create: {
        countryName: c.countryName,
        iso2: c.iso2,
        region: c.region,
        active: true,
        percentageWeight: c.weight,
        displayPriority: c.priority,
        notes: "Seeded preset — adjust in admin.",
      },
      update: {
        countryName: c.countryName,
        region: c.region,
        percentageWeight: c.weight,
        displayPriority: c.priority,
      },
    });
  }

  for (const p of protocols) {
    await db.satProtocol.upsert({
      where: { protocolCode: p.protocolCode },
      create: {
        protocolName: p.protocolName,
        protocolCode: p.protocolCode,
        protocolCategory: p.category,
        active: true,
        percentageWeight: p.weight,
        protocolMemo: p.memo,
        protocolUrlEnabled: true,
        protocolUrl: "https://sat-core.com/applications",
        allowProtocolLink: false,
        homePercentage: p.home,
        roamingPercentage: p.roam,
      },
      update: {
        protocolName: p.protocolName,
        protocolCategory: p.category,
        percentageWeight: p.weight,
        protocolMemo: p.memo,
        homePercentage: p.home,
        roamingPercentage: p.roam,
      },
    });
  }

  console.log("Authentication feed seed complete.");
}

async function main() {
  const prisma = new PrismaClient();
  try {
    await seedAuthenticationFeed(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

const runStandalone = typeof process !== "undefined" && process.argv[1]?.includes("seedAuthenticationFeed");
if (runStandalone) {
  void main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

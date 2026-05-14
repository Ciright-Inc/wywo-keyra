/**
 * Seed authentication feed tables (countries + SAT protocols + default settings).
 * Run from Keyra root: `npx tsx prisma/seedAuthenticationFeed.ts`
 * Or invoked from `prisma/seed.ts` after deployment seed.
 */
import { PrismaClient } from "@prisma/client";
import { seedSatProtocolRegistry } from "./seedSatProtocolRegistry";

export async function seedAuthenticationFeed(db: PrismaClient): Promise<void> {
  await db.authenticationFeedSetting.upsert({
    where: { id: "default" },
    create: { id: "default" },
    update: {},
  });

  // AuthenticationCountry rows: run `npm run db:seed:world-countries` for full sovereign dataset (weight 5).

  await seedSatProtocolRegistry(db);

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

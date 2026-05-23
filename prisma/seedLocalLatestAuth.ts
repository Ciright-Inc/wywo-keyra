/**
 * Local dev: seed everything needed for the "Latest authentications" feed + globe sync.
 *
 * Run from Keyra root:
 *   npm run db:seed:local-latest-auth
 *
 * Requires DATABASE_URL in `.env` (Postgres). Runs migrations first if you use:
 *   npm run db:migrate:deploy && npm run db:seed:local-latest-auth
 */
import { PrismaClient } from "@prisma/client";
import { seedAuthenticationFeed } from "./seedAuthenticationFeed";
import { seedWorldAuthenticationCountries } from "./seedWorldAuthenticationCountries";

const DEMO_ANIMATION_MS = 1200;
const DEMO_INITIAL_RECORDS = 10;

async function applyLocalDemoFeedSettings(db: PrismaClient) {
  await db.authenticationFeedSetting.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      feedEnabled: true,
      animationSpeedMs: DEMO_ANIMATION_MS,
      initialRecordsCount: DEMO_INITIAL_RECORDS,
      batchSize: 20,
      fetchThreshold: 8,
      maskingEnabled: true,
      obfuscationEnabled: false,
    },
    update: {
      feedEnabled: true,
      animationSpeedMs: DEMO_ANIMATION_MS,
      initialRecordsCount: DEMO_INITIAL_RECORDS,
      batchSize: 20,
      fetchThreshold: 8,
      obfuscationEnabled: false,
    },
  });
}

async function ensureSpotlightCountries(db: PrismaClient) {
  const spotlight = [
    { iso2: "IN", countryName: "India" },
    { iso2: "AR", countryName: "Argentina" },
    { iso2: "AW", countryName: "Aruba" },
    { iso2: "AM", countryName: "Armenia" },
    { iso2: "AG", countryName: "Antigua and Barbuda" },
  ];

  for (const row of spotlight) {
    await db.authenticationCountry.updateMany({
      where: { iso2: row.iso2 },
      data: {
        active: true,
        authenticationEnabled: true,
        percentageWeight: 12,
        displayPriority: 10,
      },
    });
  }
}

async function summary(db: PrismaClient) {
  const [countries, protocols, settings] = await Promise.all([
    db.authenticationCountry.count({
      where: { active: true, authenticationEnabled: true },
    }),
    db.satProtocol.count({ where: { active: true } }),
    db.authenticationFeedSetting.findUnique({ where: { id: "default" } }),
  ]);

  console.log("\n--- Latest authentications (local) ---");
  console.log(`Active auth countries: ${countries}`);
  console.log(`Active SAT protocols:  ${protocols}`);
  console.log(`Feed enabled:          ${settings?.feedEnabled ?? false}`);
  console.log(`New row interval:      ${settings?.animationSpeedMs ?? "?"} ms`);
  console.log(`Initial list size:     ${settings?.initialRecordsCount ?? "?"}`);
  console.log("\nOpen http://localhost:3030 and watch Latest authentications + globe dots.");
  console.log("Restart the dev server after seeding, then hard-refresh the page.\n");
}

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log("[seedLocalLatestAuth] SAT protocols + feed settings…");
    await seedAuthenticationFeed(prisma);
    await applyLocalDemoFeedSettings(prisma);

    console.log("[seedLocalLatestAuth] World authentication countries (may take ~1 min)…");
    const stats = await seedWorldAuthenticationCountries(prisma);
    console.log("[seedLocalLatestAuth] Countries:", stats);

    await ensureSpotlightCountries(prisma);
    await summary(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((e) => {
  console.error(e);
  process.exit(1);
});

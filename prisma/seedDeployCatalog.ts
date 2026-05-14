/**
 * Post-migrate catalog seed for production-style deploys.
 * Safe to run on every boot: upserts feed settings, SAT protocol registry, and (by default) world AuthenticationCountry rows.
 * Does NOT run prisma/seed.ts (no admin wipe, no deployment graph reset).
 *
 * Skip entirely: SKIP_DEPLOY_CATALOG_SEED=1
 * Skip world countries only (faster cold start): SKIP_WORLD_COUNTRIES_SEED=1
 */
import { PrismaClient } from "@prisma/client";
import { seedAuthenticationFeed } from "./seedAuthenticationFeed";
import { seedWorldAuthenticationCountries } from "./seedWorldAuthenticationCountries";

async function main() {
  if (process.env.SKIP_DEPLOY_CATALOG_SEED === "1") {
    console.info("[seedDeployCatalog] SKIP_DEPLOY_CATALOG_SEED=1 — skipping catalog seed.");
    return;
  }

  const prisma = new PrismaClient();
  try {
    await seedAuthenticationFeed(prisma);
    console.info("[seedDeployCatalog] Authentication feed + SAT protocols upserted.");

    if (process.env.SKIP_WORLD_COUNTRIES_SEED === "1") {
      console.info("[seedDeployCatalog] SKIP_WORLD_COUNTRIES_SEED=1 — world countries seed skipped.");
    } else {
      const stats = await seedWorldAuthenticationCountries(prisma);
      console.info("[seedDeployCatalog] World authentication countries:", stats);
    }
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((e) => {
  console.error("[seedDeployCatalog]", e);
  process.exit(1);
});

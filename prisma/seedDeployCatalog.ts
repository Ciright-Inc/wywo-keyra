/**
 * Post-migrate catalog seed for production-style deploys.
 * Safe to run on every boot: upserts feed settings, SAT protocol registry, (by default) world AuthenticationCountry rows,
 * and (by default) deployment map regions / CountryDeployment / TelcoDeployment from `prisma/data/deployment-seed.json`.
 * If there are no AdminUser rows yet, seeds the same demo admins as `prisma/seed.ts` (password from SEED_ADMIN_PASSWORD).
 * Does NOT run full prisma/seed.ts (no admin wipe, no access rules / server nodes reset).
 *
 * Skip entirely: SKIP_DEPLOY_CATALOG_SEED=1
 * Skip world countries only (faster cold start): SKIP_WORLD_COUNTRIES_SEED=1
 * Skip deployment map (regions / countries / telcos): SKIP_DEPLOYMENT_GRAPH_SEED=1
 * Skip telco catalog import (541 operators from keyra-telcos-catalog.json): SKIP_TELCO_CATALOG_SEED=1
 */
import { PrismaClient } from "@prisma/client";
import { seedAdminUsersIfEmpty } from "./seedAdminUsersIfEmpty";
import { seedAuthenticationFeed } from "./seedAuthenticationFeed";
import { seedDeploymentGraph } from "./seedDeploymentGraph";
import { importKeyraTelcosFromCatalog } from "./importKeyraTelcos";
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

    if (process.env.SKIP_DEPLOYMENT_GRAPH_SEED === "1") {
      console.info("[seedDeployCatalog] SKIP_DEPLOYMENT_GRAPH_SEED=1 — deployment map seed skipped.");
    } else {
      const d = await seedDeploymentGraph(prisma);
      console.info("[seedDeployCatalog] Deployment map (regions / countries / telcos):", d);

      if (process.env.SKIP_TELCO_CATALOG_SEED === "1") {
        console.info("[seedDeployCatalog] SKIP_TELCO_CATALOG_SEED=1 — telco catalog import skipped.");
      } else {
        const telcos = await importKeyraTelcosFromCatalog(prisma);
        console.info("[seedDeployCatalog] Telco catalog (keyra-telcos-catalog.json):", telcos);
      }
    }

    const adminBoot = await seedAdminUsersIfEmpty(prisma);
    if (adminBoot !== "skipped") {
      console.info("[seedDeployCatalog] Admin user bootstrap:", adminBoot);
    }
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((e) => {
  console.error("[seedDeployCatalog]", e);
  process.exit(1);
});

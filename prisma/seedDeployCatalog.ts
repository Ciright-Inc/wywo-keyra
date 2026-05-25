/**
 * Post-migrate catalog seed for production-style deploys.
 * Safe to run on every boot: upserts feed settings, SAT protocol registry, (by default) world AuthenticationCountry rows,
 * and (by default) deployment map regions / CountryDeployment from `prisma/data/regions-countries-seed.json`
 * plus telcos from `prisma/data/deployment-seed.json`.
 * Upserts admin users from `prisma/data/admin-users-seed.json` (Admin users tab records).
 * Does NOT run full prisma/seed.ts (no admin wipe, no access rules / server nodes reset).
 *
 * When catalog data is already present, heavy upserts are skipped so restarts stay fast and idempotent.
 * When admin users already exist, admin seed is skipped to avoid duplicate boot work and phone collisions.
 *
 * Skip entirely: SKIP_DEPLOY_CATALOG_SEED=1
 * Force all upserts even when data exists: FORCE_DEPLOY_CATALOG_SEED=1
 * Skip world countries only (faster cold start): SKIP_WORLD_COUNTRIES_SEED=1
 * Skip deployment map (regions / countries / telcos): SKIP_DEPLOYMENT_GRAPH_SEED=1
 * Skip telco catalog import (541 operators from keyra-telcos-catalog.json): SKIP_TELCO_CATALOG_SEED=1
 * Skip site footer seed: SKIP_SITE_FOOTER_SEED=1
 * Force footer re-seed from JSON: FORCE_SITE_FOOTER_SEED=1
 */
import { PrismaClient } from "@prisma/client";
import { seedAdminUsers } from "./seedAdminUsers";
import { seedAuthenticationFeed } from "./seedAuthenticationFeed";
import { seedDeploymentGraph } from "./seedDeploymentGraph";
import { importKeyraTelcosFromCatalog } from "./importKeyraTelcos";
import { seedWorldAuthenticationCountries } from "./seedWorldAuthenticationCountries";
import { seedSiteFooter } from "./seedSiteFooter";
import { seedAgentWorld } from "./seedAgentWorld";
import { seedDeploymentApps } from "./seedDeploymentApps";

async function isDeployCatalogPresent(prisma: PrismaClient): Promise<boolean> {
  const regionCount = await prisma.region.count();
  return regionCount > 0;
}

async function hasAdminUsers(prisma: PrismaClient): Promise<boolean> {
  return (await prisma.adminUser.count()) > 0;
}

async function main() {
  if (process.env.SKIP_DEPLOY_CATALOG_SEED === "1") {
    console.info("[seedDeployCatalog] SKIP_DEPLOY_CATALOG_SEED=1 — skipping catalog seed.");
    return;
  }

  const force = process.env.FORCE_DEPLOY_CATALOG_SEED === "1";
  const prisma = new PrismaClient();
  try {
    const catalogPresent = await isDeployCatalogPresent(prisma);
    const adminPresent = await hasAdminUsers(prisma);

    if (catalogPresent && !force) {
      console.info(
        "[seedDeployCatalog] Deployment catalog already present — skipping catalog upserts. Set FORCE_DEPLOY_CATALOG_SEED=1 to re-run.",
      );
    } else {
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
    }

    if (adminPresent && !force) {
      console.info(
        "[seedDeployCatalog] Admin users already present — skipping admin user seed. Set FORCE_DEPLOY_CATALOG_SEED=1 to re-run.",
      );
    } else {
      const adminStats = await seedAdminUsers(prisma, { skipIfAnyExist: !force });
      console.info("[seedDeployCatalog] Admin users:", adminStats);
    }

    if (process.env.SKIP_SITE_FOOTER_SEED === "1") {
      console.info("[seedDeployCatalog] SKIP_SITE_FOOTER_SEED=1 — site footer seed skipped.");
    } else {
      const footerStats = await seedSiteFooter(prisma, {
        force: force || process.env.FORCE_SITE_FOOTER_SEED === "1",
      });
      console.info("[seedDeployCatalog] Site footer:", footerStats);
    }

    if (process.env.SKIP_AGENT_WORLD_SEED === "1") {
      console.info("[seedDeployCatalog] SKIP_AGENT_WORLD_SEED=1 — agent world seed skipped.");
    } else {
      await seedAgentWorld(prisma);
    }

    const deploymentApps = await seedDeploymentApps(prisma);
    console.info("[seedDeployCatalog] Deployment apps (launcher / admin):", deploymentApps);
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((e) => {
  console.error("[seedDeployCatalog]", e);
  process.exit(1);
});

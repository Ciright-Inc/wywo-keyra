/**
 * Idempotent sync of ecosystem apps into DeploymentApp (admin Apps tab + 9-dot launcher).
 * Inserts any missing defaults — does not overwrite admin edits.
 *
 * Runs on production boot via `npm run db:seed:deploy-catalog`.
 * Manual: `npm run db:seed:deployment-apps`
 */
import { PrismaClient } from "@prisma/client";
import { syncDeploymentAppsDefaults } from "../src/lib/syncDeploymentApps";

export { syncDeploymentAppsDefaults as seedDeploymentApps };

const runStandalone = typeof process !== "undefined" && process.argv[1]?.includes("seedDeploymentApps");

if (runStandalone) {
  const prisma = new PrismaClient();
  syncDeploymentAppsDefaults(prisma)
    .then((stats) => {
      console.info("[seedDeploymentApps]", stats);
    })
    .catch((err) => {
      console.error("[seedDeploymentApps]", err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

/**
 * Seed Agent Worlds admin tabs only (no deployment map, admin users, or footer).
 *
 * Populates:
 *   • Control center      — KPIs + deployment events
 *   • Parent agents       — Ciright parent designs
 *   • Deployment bridge   — Keyra marketplace agents
 *   • Agent worlds        — sovereign tenant environments
 *   • Knowledge packs     — approved operational knowledge
 *   • Inheritance         — tenant agent instances + lineage
 *   • Operational graph   — intrinsic index + graph edges
 *
 * Live (Railway / production):
 *   1. Ensure migrations are applied:  npm run db:migrate:deploy
 *   2. Seed agent worlds only:
 *        npm run db:seed:agent-world
 *      Re-seed (replaces catalog):
 *        FORCE_AGENT_WORLD_SEED=1 npm run db:seed:agent-world
 *
 * Skips when parent agents already exist unless FORCE_AGENT_WORLD_SEED=1.
 */
import { PrismaClient } from "@prisma/client";
import { seedAgentWorld } from "./seedAgentWorld";

const TAB_LABELS: Record<string, string> = {
  parentAgents: "Parent agents",
  keyraAgents: "Deployment bridge",
  agentWorlds: "Agent worlds",
  knowledgePacks: "Knowledge packs",
  tenantInstances: "Inheritance",
  graphEdges: "Operational graph (edges)",
  indexEntries: "Operational graph (index)",
  deploymentEvents: "Control center (events)",
  integrations: "World integrations",
};

async function main() {
  const prisma = new PrismaClient();
  try {
    const stats = await seedAgentWorld(prisma);

    console.info(
      stats.skipped
        ? "[seedAgentWorldOnly] Catalog already present — counts:"
        : "[seedAgentWorldOnly] Seeded Agent Worlds tabs:",
    );
    for (const [key, label] of Object.entries(TAB_LABELS)) {
      const value = stats[key as keyof typeof stats];
      if (key === "skipped" || typeof value !== "number") continue;
      console.info(`  • ${label}: ${value}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((e) => {
  console.error("[seedAgentWorldOnly]", e);
  process.exit(1);
});

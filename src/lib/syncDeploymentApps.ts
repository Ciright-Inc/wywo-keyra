import type { PrismaClient } from "@prisma/client";
import { buildDefaultDeploymentAppRows } from "@/lib/deploymentAppDefaults";

export type DeploymentAppsSeedStats = {
  inserted: number;
  skippedExisting: number;
};

/** Insert missing ecosystem apps — does not overwrite existing rows (preserves admin edits). */
export async function syncDeploymentAppsDefaults(
  prisma: Pick<PrismaClient, "deploymentApp">,
): Promise<DeploymentAppsSeedStats> {
  const defaults = buildDefaultDeploymentAppRows();
  const existingIds = new Set(
    (await prisma.deploymentApp.findMany({ select: { id: true } })).map((row) => row.id),
  );

  const missing = defaults.filter((row) => !existingIds.has(row.id));
  if (missing.length === 0) {
    return { inserted: 0, skippedExisting: defaults.length };
  }

  const result = await prisma.deploymentApp.createMany({
    data: missing,
    skipDuplicates: true,
  });

  return {
    inserted: result.count,
    skippedExisting: defaults.length - missing.length,
  };
}

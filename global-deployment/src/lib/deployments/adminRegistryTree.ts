import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import type { PublicDeploymentTree } from "@/lib/deployments/publicTree";
import { shapeDeploymentTree } from "@/lib/deployments/publicTree";

const adminRegistryInclude = {
  countries: {
    orderBy: [{ sortOrder: "asc" as const }, { name: "asc" as const }],
    include: {
      telcos: {
        orderBy: [{ sortOrder: "asc" as const }, { name: "asc" as const }],
      },
    },
  },
} satisfies Prisma.RegionInclude;

/**
 * Live admin registry — identical Region / CountryDeployment / TelcoDeployment rows
 * as Keyra admin (`/admin/deployments/regions` + `/admin/deployments/countries`).
 * No publish filter and no seed fallback: only what exists in admin Postgres.
 */
export async function loadAdminRegistryTree(): Promise<PublicDeploymentTree> {
  const regions = await prisma.region.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: adminRegistryInclude,
  });

  return shapeDeploymentTree(regions);
}

export async function getAdminRegistryTree(): Promise<PublicDeploymentTree> {
  return loadAdminRegistryTree();
}

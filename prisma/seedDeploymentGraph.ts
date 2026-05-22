/**
 * Idempotent upsert of deployment telcos (+ optional access rules in full seed) from
 * `prisma/data/deployment-seed.json`. Regions and countries are seeded separately via
 * `seedRegionsAndCountries` (`prisma/data/regions-countries-seed.json`).
 */
import { PrismaClient } from "@prisma/client";
import { buildTelcoSubdomainForSeed, loadDeploymentSeed } from "./deploymentSeedData";
import { seedRegionsAndCountries, type RegionsCountriesSeedStats } from "./seedRegionsCountries";

export type DeploymentGraphSeedStats = RegionsCountriesSeedStats & {
  telcosUpserted: number;
  placeholderTelcosUpserted: number;
};

export async function seedDeploymentGraph(prisma: PrismaClient): Promise<DeploymentGraphSeedStats> {
  const regionStats = await seedRegionsAndCountries(prisma);

  const data = loadDeploymentSeed();
  const countries = await prisma.countryDeployment.findMany({
    select: { id: true, iso2: true, countrySubdomain: true },
  });
  const countryByIso2 = new Map(
    countries.map((c) => [c.iso2.toUpperCase(), { id: c.id, countrySubdomain: c.countrySubdomain }]),
  );

  let telcosUpserted = 0;
  for (const t of data.telcos) {
    const country = countryByIso2.get(t.countryIso2.toUpperCase());
    if (!country) throw new Error(`[seedDeploymentGraph] Missing country ISO2: ${t.countryIso2}`);
    const telcoSubdomain = buildTelcoSubdomainForSeed(country.countrySubdomain, t.slug);

    await prisma.telcoDeployment.upsert({
      where: {
        countryId_slug: {
          countryId: country.id,
          slug: t.slug,
        },
      },
      create: {
        countryId: country.id,
        name: t.name,
        slug: t.slug,
        subscribers: t.subscribers,
        subscribersDisplay: t.subscribersDisplay,
        telcoSubdomain,
        officialDomain: t.officialDomain,
        status: t.status as never,
        sortOrder: t.sortOrder,
        isPublished: t.isPublished,
      },
      update: {
        name: t.name,
        subscribers: t.subscribers,
        subscribersDisplay: t.subscribersDisplay,
        telcoSubdomain,
        officialDomain: t.officialDomain,
        status: t.status as never,
        sortOrder: t.sortOrder,
        isPublished: t.isPublished,
      },
    });
    telcosUpserted++;
  }

  return {
    ...regionStats,
    telcosUpserted,
    placeholderTelcosUpserted: 0,
  };
}

const runStandalone = typeof process !== "undefined" && process.argv[1]?.includes("seedDeploymentGraph");
if (runStandalone) {
  async function main() {
    const prisma = new PrismaClient();
    try {
      const stats = await seedDeploymentGraph(prisma);
      console.info("[seedDeploymentGraph]", stats);
    } finally {
      await prisma.$disconnect();
    }
  }
  void main().catch((e) => {
    console.error("[seedDeploymentGraph]", e);
    process.exit(1);
  });
}

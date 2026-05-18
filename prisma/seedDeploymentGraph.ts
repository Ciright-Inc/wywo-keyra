/**
 * Idempotent upsert of global deployment map rows (regions, countries, telcos) from
 * `prisma/data/deployment-seed.json`, plus every ISO-3166 alpha-2 territory from `world-countries`
 * (region: global-catalog, subdomain `{iso2}.keyra.ie`, not published by default) and a placeholder
 * telco per country that would otherwise have none — so the admin telcos UI lists all countries.
 * Safe on every production boot: does not wipe admins, audit, access rules, or server nodes
 * (those remain `prisma db seed` only).
 */
import { DeploymentStatus, PrismaClient } from "@prisma/client";
import { buildTelcoSubdomainForSeed, loadDeploymentSeed } from "./deploymentSeedData";
import { allWorldCountriesWithIso2 } from "./worldCountriesIso";

const PLACEHOLDER_TELCO_SLUG = "national-carriers";
const PLACEHOLDER_TELCO_NAME = "National carriers (catalog)";

export type DeploymentGraphSeedStats = {
  regionsUpserted: number;
  countriesUpserted: number;
  telcosUpserted: number;
  worldCatalogCountriesUpserted: number;
  placeholderTelcosUpserted: number;
};

export async function seedDeploymentGraph(prisma: PrismaClient): Promise<DeploymentGraphSeedStats> {
  const data = loadDeploymentSeed();
  const regionBySlug = new Map<string, { id: string }>();
  let regionsUpserted = 0;

  for (const r of data.regions) {
    const row = await prisma.region.upsert({
      where: { slug: r.slug },
      create: {
        continentCode: r.continentCode,
        subregionCode: r.subregionCode,
        name: r.name,
        slug: r.slug,
        mapKey: r.mapKey,
        sortOrder: r.sortOrder,
        isPublished: r.isPublished,
      },
      update: {
        continentCode: r.continentCode,
        subregionCode: r.subregionCode,
        name: r.name,
        mapKey: r.mapKey,
        sortOrder: r.sortOrder,
        isPublished: r.isPublished,
      },
    });
    regionBySlug.set(r.slug, { id: row.id });
    regionsUpserted++;
  }

  const globalCatalogRegion = regionBySlug.get("global-catalog");
  if (!globalCatalogRegion) {
    throw new Error("[seedDeploymentGraph] Missing region slug: global-catalog (add to deployment-seed.json).");
  }

  const countryByIso2 = new Map<string, { id: string; countrySubdomain: string }>();
  let countriesUpserted = 0;

  for (const c of data.countries) {
    const region = regionBySlug.get(c.regionSlug);
    if (!region) throw new Error(`[seedDeploymentGraph] Missing region slug: ${c.regionSlug}`);
    const subdomain = c.countrySubdomain.toLowerCase();
    const row = await prisma.countryDeployment.upsert({
      where: { countrySubdomain: subdomain },
      create: {
        regionId: region.id,
        name: c.name,
        iso2: c.iso2.toUpperCase(),
        iso3: c.iso3.toUpperCase(),
        flagAssetKey: c.flagAssetKey,
        population: c.population,
        populationDisplay: c.populationDisplay,
        countrySubdomain: subdomain,
        officialReferenceDomain: c.officialReferenceDomain,
        status: c.status as DeploymentStatus,
        statusNote: c.statusNote,
        sourceLabel: c.sourceLabel,
        sourceUrl: c.sourceUrl,
        sourceVerifiedAt: c.sourceVerifiedAt ? new Date(c.sourceVerifiedAt) : null,
        sortOrder: c.sortOrder,
        isPublished: c.isPublished,
      },
      update: {
        regionId: region.id,
        name: c.name,
        iso2: c.iso2.toUpperCase(),
        iso3: c.iso3.toUpperCase(),
        flagAssetKey: c.flagAssetKey,
        population: c.population,
        populationDisplay: c.populationDisplay,
        officialReferenceDomain: c.officialReferenceDomain,
        status: c.status as DeploymentStatus,
        statusNote: c.statusNote,
        sourceLabel: c.sourceLabel,
        sourceUrl: c.sourceUrl,
        sourceVerifiedAt: c.sourceVerifiedAt ? new Date(c.sourceVerifiedAt) : null,
        sortOrder: c.sortOrder,
        isPublished: c.isPublished,
      },
    });
    countryByIso2.set(c.iso2.toUpperCase(), { id: row.id, countrySubdomain: row.countrySubdomain });
    countriesUpserted++;
  }

  let worldCatalogCountriesUpserted = 0;
  let worldCatalogSort = 10000;

  for (const wc of allWorldCountriesWithIso2()) {
    const iso2 = wc.cca2.toUpperCase();
    if (countryByIso2.has(iso2)) continue;

    const subdomain = `${iso2.toLowerCase()}.keyra.ie`;
    const name = wc.name.common;
    const iso3 = (wc.cca3 ?? "XXX").toUpperCase();
    const flagAssetKey = iso2.toLowerCase();
    worldCatalogSort += 1;

    const row = await prisma.countryDeployment.upsert({
      where: { countrySubdomain: subdomain },
      create: {
        regionId: globalCatalogRegion.id,
        name,
        iso2,
        iso3,
        flagAssetKey,
        population: null,
        populationDisplay: null,
        countrySubdomain: subdomain,
        officialReferenceDomain: null,
        status: DeploymentStatus.IDENTIFIED,
        statusNote: "Auto-seeded from world-countries; refine in admin.",
        sourceLabel: "world-countries (npm)",
        sourceUrl: "https://www.npmjs.com/package/world-countries",
        sourceVerifiedAt: new Date(),
        sortOrder: worldCatalogSort,
        isPublished: false,
      },
      update: {
        regionId: globalCatalogRegion.id,
        name,
        iso2,
        iso3,
        flagAssetKey,
      },
    });

    countryByIso2.set(iso2, { id: row.id, countrySubdomain: row.countrySubdomain });
    worldCatalogCountriesUpserted++;
  }

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
        status: t.status as DeploymentStatus,
        sortOrder: t.sortOrder,
        isPublished: t.isPublished,
      },
      update: {
        name: t.name,
        subscribers: t.subscribers,
        subscribersDisplay: t.subscribersDisplay,
        telcoSubdomain,
        officialDomain: t.officialDomain,
        status: t.status as DeploymentStatus,
        sortOrder: t.sortOrder,
        isPublished: t.isPublished,
      },
    });
    telcosUpserted++;
  }

  let placeholderTelcosUpserted = 0;
  for (const { id, countrySubdomain } of countryByIso2.values()) {
    const existingCount = await prisma.telcoDeployment.count({ where: { countryId: id } });
    if (existingCount > 0) continue;

    const telcoSubdomain = buildTelcoSubdomainForSeed(countrySubdomain, PLACEHOLDER_TELCO_SLUG);
    await prisma.telcoDeployment.upsert({
      where: {
        countryId_slug: {
          countryId: id,
          slug: PLACEHOLDER_TELCO_SLUG,
        },
      },
      create: {
        countryId: id,
        name: PLACEHOLDER_TELCO_NAME,
        slug: PLACEHOLDER_TELCO_SLUG,
        subscribers: null,
        subscribersDisplay: null,
        telcoSubdomain,
        officialDomain: null,
        status: DeploymentStatus.IDENTIFIED,
        sortOrder: 0,
        isPublished: false,
      },
      update: {
        name: PLACEHOLDER_TELCO_NAME,
        telcoSubdomain,
        status: DeploymentStatus.IDENTIFIED,
        isPublished: false,
      },
    });
    placeholderTelcosUpserted++;
  }

  return {
    regionsUpserted,
    countriesUpserted,
    telcosUpserted,
    worldCatalogCountriesUpserted,
    placeholderTelcosUpserted,
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

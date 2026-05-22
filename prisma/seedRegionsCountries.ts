/**
 * Idempotent seed for admin Regions + Countries tabs.
 *
 * Data: `prisma/data/regions-countries-seed.json`
 * - Upserts all deployment regions (incl. Caribbean, Central America).
 * - Upserts featured countries (curated demo rows).
 * - Upserts every other ISO-3166 alpha-2 territory from `world-countries` into the
 *   mapped region (Caribbean, Central America, etc.) or global-catalog fallback.
 * - Reassigns existing catalog rows by ISO2 on every run (safe for deploy).
 *
 * Runs automatically via `npm run db:seed:deploy-catalog` on production start.
 * Manual: `npm run db:seed:regions-countries`
 */
import type { Country } from "world-countries";
import { DeploymentStatus, PrismaClient } from "@prisma/client";
import { allWorldCountriesWithIso2 } from "./worldCountriesIso";
import { loadRegionsCountriesSeed } from "./regionsCountriesSeedData";

export type RegionsCountriesSeedStats = {
  regionsUpserted: number;
  featuredCountriesUpserted: number;
  worldCatalogCountriesUpserted: number;
  existingCountriesReassigned: number;
};

function regionSlugForWorldSubregion(
  subregion: string | undefined | null,
  mapping: Record<string, string>,
): string | null {
  if (!subregion?.trim()) return null;
  return mapping[subregion.trim()] ?? null;
}

function resolveTargetRegionId(
  wc: Country,
  regionBySlug: Map<string, { id: string }>,
  globalCatalogRegionId: string,
  mapping: Record<string, string>,
): string {
  const mappedSlug = regionSlugForWorldSubregion(wc.subregion, mapping);
  const mappedRegion = mappedSlug ? regionBySlug.get(mappedSlug) : undefined;
  return mappedRegion?.id ?? globalCatalogRegionId;
}

export async function seedRegionsAndCountries(prisma: PrismaClient): Promise<RegionsCountriesSeedStats> {
  const data = loadRegionsCountriesSeed();
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
    throw new Error("[seedRegionsCountries] Missing region slug: global-catalog");
  }

  const featuredIso2 = new Set<string>();
  const countryByIso2 = new Map<string, { id: string; countrySubdomain: string }>();
  let featuredCountriesUpserted = 0;

  for (const c of data.featuredCountries) {
    const region = regionBySlug.get(c.regionSlug);
    if (!region) throw new Error(`[seedRegionsCountries] Missing region slug: ${c.regionSlug}`);
    const subdomain = c.countrySubdomain.toLowerCase();
    const iso2 = c.iso2.toUpperCase();
    featuredIso2.add(iso2);

    const row = await prisma.countryDeployment.upsert({
      where: { countrySubdomain: subdomain },
      create: {
        regionId: region.id,
        name: c.name,
        iso2,
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
        iso2,
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
    countryByIso2.set(iso2, { id: row.id, countrySubdomain: row.countrySubdomain });
    featuredCountriesUpserted++;
  }

  const worldByIso2 = new Map(allWorldCountriesWithIso2().map((wc) => [wc.cca2.toUpperCase(), wc]));
  let worldCatalogCountriesUpserted = 0;
  let worldCatalogSort = 10000;

  for (const wc of worldByIso2.values()) {
    const iso2 = wc.cca2.toUpperCase();
    if (featuredIso2.has(iso2)) continue;

    const subdomain = `${iso2.toLowerCase()}.keyra.ie`;
    const targetRegionId = resolveTargetRegionId(
      wc,
      regionBySlug,
      globalCatalogRegion.id,
      data.worldSubregionToRegionSlug,
    );
    worldCatalogSort += 1;

    const row = await prisma.countryDeployment.upsert({
      where: { countrySubdomain: subdomain },
      create: {
        regionId: targetRegionId,
        name: wc.name.common,
        iso2,
        iso3: (wc.cca3 ?? "XXX").toUpperCase(),
        flagAssetKey: iso2.toLowerCase(),
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
        regionId: targetRegionId,
        name: wc.name.common,
        iso2,
        iso3: (wc.cca3 ?? "XXX").toUpperCase(),
        flagAssetKey: iso2.toLowerCase(),
      },
    });

    countryByIso2.set(iso2, { id: row.id, countrySubdomain: row.countrySubdomain });
    worldCatalogCountriesUpserted++;
  }

  let existingCountriesReassigned = 0;
  const catalogRows = await prisma.countryDeployment.findMany({
    where: { iso2: { notIn: Array.from(featuredIso2) } },
    select: { id: true, iso2: true, regionId: true },
  });

  for (const row of catalogRows) {
    const wc = worldByIso2.get(row.iso2.toUpperCase());
    if (!wc) continue;
    const targetRegionId = resolveTargetRegionId(
      wc,
      regionBySlug,
      globalCatalogRegion.id,
      data.worldSubregionToRegionSlug,
    );
    if (row.regionId === targetRegionId) continue;
    await prisma.countryDeployment.update({
      where: { id: row.id },
      data: { regionId: targetRegionId },
    });
    existingCountriesReassigned++;
  }

  return {
    regionsUpserted,
    featuredCountriesUpserted,
    worldCatalogCountriesUpserted,
    existingCountriesReassigned,
  };
}

const runStandalone = typeof process !== "undefined" && process.argv[1]?.includes("seedRegionsCountries");
if (runStandalone) {
  async function main() {
    const prisma = new PrismaClient();
    try {
      const stats = await seedRegionsAndCountries(prisma);
      console.info("[seedRegionsCountries]", stats);
    } finally {
      await prisma.$disconnect();
    }
  }
  void main().catch((e) => {
    console.error("[seedRegionsCountries]", e);
    process.exit(1);
  });
}

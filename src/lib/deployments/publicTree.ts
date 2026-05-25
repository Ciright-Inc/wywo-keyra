import type { CountryDeployment } from "@prisma/client";
import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";
import { PUBLIC_DEPLOYMENTS_CACHE_TAG } from "@/lib/deployments/cacheTags";
export type {
  PublicTelco,
  PublicCountry,
  PublicRegionListItem,
  PublicCountryListItem,
  PublicRegion,
  PublicDeploymentTree,
} from "@/lib/deployments/publicTreeShared";
export {
  filterPublicTree,
  findCountryInTree,
  publicSlugFromSubdomain,
} from "@/lib/deployments/publicTreeShared";
import type {
  PublicCountry,
  PublicCountryListItem,
  PublicDeploymentTree,
  PublicRegion,
  PublicRegionListItem,
  PublicTelco,
} from "@/lib/deployments/publicTreeShared";
import { publicSlugFromSubdomain } from "@/lib/deployments/publicTreeShared";

function countryToPublicBase(c: CountryDeployment): Omit<PublicCountry, "telcos"> {
  return {
    id: c.id,
    name: c.name,
    iso2: c.iso2,
    iso3: c.iso3,
    flagAssetKey: c.flagAssetKey,
    population: c.population,
    populationDisplay: c.populationDisplay,
    countrySubdomain: c.countrySubdomain,
    officialReferenceDomain: c.officialReferenceDomain,
    status: c.status,
    statusNote: c.statusNote,
    sourceLabel: c.sourceLabel,
    sourceUrl: c.sourceUrl,
    sourceVerifiedAt: c.sourceVerifiedAt,
    sortOrder: c.sortOrder,
    latitude: c.latitude,
    longitude: c.longitude,
    visualOffsetX: c.visualOffsetX,
    visualOffsetY: c.visualOffsetY,
    deploymentStage: c.deploymentStage,
    infrastructureHealth: c.infrastructureHealth,
    uptimePercentage: c.uptimePercentage,
    nodeHealth: c.nodeHealth,
    authVolume: c.authVolume,
    clusterRegion: c.clusterRegion,
    lastSyncAt: c.lastSyncAt,
    aiAgentEnabled: c.aiAgentEnabled,
    deploymentScore: c.deploymentScore,
    satProtocolCoverage: c.satProtocolCoverage,
    simEsimStatus: c.simEsimStatus,
    govIntegrationStatus: c.govIntegrationStatus,
    apiStatus: c.apiStatus,
    regulatoryReadiness: c.regulatoryReadiness,
    riskStatus: c.riskStatus,
    connectedAppsCount: c.connectedAppsCount,
    publicSlug: publicSlugFromSubdomain(c.countrySubdomain),
  };
}

async function loadTree(): Promise<PublicDeploymentTree> {
  const regions = await prisma.region.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      countries: {
        where: { isPublished: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        include: {
          telcos: {
            where: { isPublished: true },
            orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          },
        },
      },
    },
  });

  const shaped: PublicRegion[] = regions.map((r) => ({
    id: r.id,
    continentCode: r.continentCode,
    subregionCode: r.subregionCode,
    name: r.name,
    slug: r.slug,
    mapKey: r.mapKey,
    sortOrder: r.sortOrder,
    countries: r.countries.map((c) => ({
      ...countryToPublicBase(c),
      telcos: c.telcos.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        subscribers: t.subscribers,
        subscribersDisplay: t.subscribersDisplay,
        telcoSubdomain: t.telcoSubdomain,
        officialDomain: t.officialDomain,
        status: t.status,
        statusNote: t.statusNote,
        sourceLabel: t.sourceLabel,
        sourceUrl: t.sourceUrl,
        sourceVerifiedAt: t.sourceVerifiedAt,
        sortOrder: t.sortOrder,
      })),
    })),
  }));

  const mapKeys = Array.from(
    new Set(shaped.map((r) => r.mapKey).filter(Boolean)),
  ).sort();

  return { regions: shaped, mapKeys };
}

export const getPublicDeploymentTree = unstable_cache(
  async () => loadTree(),
  ["deployment-tree-v1"],
  { tags: [PUBLIC_DEPLOYMENTS_CACHE_TAG] },
);

async function loadCatalogRegionsList(): Promise<PublicRegionListItem[]> {
  return prisma.region.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      continentCode: true,
      subregionCode: true,
      name: true,
      slug: true,
      mapKey: true,
      sortOrder: true,
      isPublished: true,
    },
  });
}

async function loadCatalogCountriesList(): Promise<PublicCountryListItem[]> {
  const countries = await prisma.countryDeployment.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      region: {
        select: { id: true, name: true, slug: true, mapKey: true },
      },
    },
  });

  return countries.map((c) => ({
    ...countryToPublicBase(c),
    regionId: c.region.id,
    regionName: c.region.name,
    regionSlug: c.region.slug,
    mapKey: c.region.mapKey,
    isPublished: c.isPublished,
  }));
}

const getCachedCatalogRegionsList = unstable_cache(
  async () => loadCatalogRegionsList(),
  ["deployment-catalog-regions-v1"],
  { tags: [PUBLIC_DEPLOYMENTS_CACHE_TAG] },
);

const getCachedCatalogCountriesList = unstable_cache(
  async () => loadCatalogCountriesList(),
  ["deployment-catalog-countries-v1"],
  { tags: [PUBLIC_DEPLOYMENTS_CACHE_TAG] },
);

/** Full deployment catalog — all regions (published and draft). */
export async function getPublicRegionsList(): Promise<PublicRegionListItem[]> {
  return getCachedCatalogRegionsList();
}

/** Full deployment catalog — all countries (published and draft). */
export async function getPublicCountriesList(): Promise<PublicCountryListItem[]> {
  return getCachedCatalogCountriesList();
}

const PUBLIC_LIST_CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
} as const;

export { PUBLIC_LIST_CACHE_HEADERS };

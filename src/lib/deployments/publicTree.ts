import type { CountryDeployment, Region, TelcoDeployment } from "@prisma/client";
import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";
import { PUBLIC_DEPLOYMENTS_CACHE_TAG } from "@/lib/deployments/cacheTags";

export type PublicTelco = Pick<
  TelcoDeployment,
  | "id"
  | "name"
  | "slug"
  | "subscribers"
  | "subscribersDisplay"
  | "telcoSubdomain"
  | "officialDomain"
  | "status"
  | "statusNote"
  | "sourceLabel"
  | "sourceUrl"
  | "sourceVerifiedAt"
  | "sortOrder"
>;

export type PublicCountry = Pick<
  CountryDeployment,
  | "id"
  | "name"
  | "iso2"
  | "iso3"
  | "flagAssetKey"
  | "population"
  | "populationDisplay"
  | "countrySubdomain"
  | "officialReferenceDomain"
  | "status"
  | "statusNote"
  | "sourceLabel"
  | "sourceUrl"
  | "sourceVerifiedAt"
  | "sortOrder"
  | "latitude"
  | "longitude"
  | "visualOffsetX"
  | "visualOffsetY"
  | "deploymentStage"
  | "infrastructureHealth"
  | "uptimePercentage"
  | "nodeHealth"
  | "authVolume"
  | "clusterRegion"
  | "lastSyncAt"
  | "aiAgentEnabled"
  | "deploymentScore"
  | "satProtocolCoverage"
  | "simEsimStatus"
  | "govIntegrationStatus"
  | "apiStatus"
  | "regulatoryReadiness"
  | "riskStatus"
  | "connectedAppsCount"
> & {
  /** First label of `countrySubdomain` (before `.`), stable for public URLs */
  publicSlug: string;
  telcos: PublicTelco[];
};

export type PublicRegion = Pick<
  Region,
  "id" | "continentCode" | "subregionCode" | "name" | "slug" | "mapKey" | "sortOrder"
> & {
  countries: PublicCountry[];
};

export type PublicDeploymentTree = {
  regions: PublicRegion[];
  mapKeys: string[];
};

function publicSlugFromSubdomain(countrySubdomain: string): string {
  const lower = countrySubdomain.toLowerCase();
  const idx = lower.indexOf(".");
  return idx === -1 ? lower : lower.slice(0, idx);
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

export function filterPublicTree(
  tree: PublicDeploymentTree,
  filters: { continentCode?: string; subregionCode?: string; mapKey?: string },
): PublicDeploymentTree {
  let regions = tree.regions;
  if (filters.mapKey) {
    regions = regions.filter((r) => r.mapKey === filters.mapKey);
  }
  if (filters.continentCode) {
    regions = regions.filter((r) => r.continentCode === filters.continentCode);
  }
  if (filters.subregionCode) {
    regions = regions.filter((r) => r.subregionCode === filters.subregionCode);
  }
  return { regions, mapKeys: tree.mapKeys };
}

export function findCountryInTree(
  tree: PublicDeploymentTree,
  countrySlug: string,
): PublicCountry | null {
  const want = countrySlug.trim().toLowerCase();
  for (const r of tree.regions) {
    for (const c of r.countries) {
      if (c.publicSlug === want) return c;
    }
  }
  return null;
}

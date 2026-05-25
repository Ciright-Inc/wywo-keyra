import type { CountryDeployment, Region, TelcoDeployment } from "@prisma/client";

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
  publicSlug: string;
  telcos: PublicTelco[];
};

export type PublicRegionListItem = Pick<
  Region,
  | "id"
  | "continentCode"
  | "subregionCode"
  | "name"
  | "slug"
  | "mapKey"
  | "sortOrder"
  | "isPublished"
>;

export type PublicCountryListItem = Omit<PublicCountry, "telcos"> & {
  regionId: string;
  regionName: string;
  regionSlug: string;
  mapKey: string;
  isPublished: boolean;
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

export function publicSlugFromSubdomain(countrySubdomain: string): string {
  const lower = countrySubdomain.toLowerCase();
  const idx = lower.indexOf(".");
  return idx === -1 ? lower : lower.slice(0, idx);
}

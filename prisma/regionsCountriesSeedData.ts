import { readFileSync } from "node:fs";
import { join } from "node:path";

export type RegionsCountriesSeedRegion = {
  continentCode: string;
  subregionCode: string;
  name: string;
  slug: string;
  mapKey: string;
  sortOrder: number;
  isPublished: boolean;
};

export type RegionsCountriesSeedCountry = {
  regionSlug: string;
  name: string;
  iso2: string;
  iso3: string;
  flagAssetKey: string;
  population: number | null;
  populationDisplay: string | null;
  countrySubdomain: string;
  officialReferenceDomain: string | null;
  status: string;
  statusNote: string | null;
  sourceLabel: string | null;
  sourceUrl: string | null;
  sourceVerifiedAt: string | null;
  sortOrder: number;
  isPublished: boolean;
};

export type RegionsCountriesSeedFile = {
  version: number;
  regions: RegionsCountriesSeedRegion[];
  featuredCountries: RegionsCountriesSeedCountry[];
  worldSubregionToRegionSlug: Record<string, string>;
};

export function loadRegionsCountriesSeed(): RegionsCountriesSeedFile {
  const p = join(process.cwd(), "prisma", "data", "regions-countries-seed.json");
  const raw = readFileSync(p, "utf8");
  return JSON.parse(raw) as RegionsCountriesSeedFile;
}

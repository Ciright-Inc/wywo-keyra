import { loadRegionsCountriesSeed } from "./regionsCountriesSeedData";

/** Maps `world-countries` subregion labels to deployment `Region.slug` (from regions-countries-seed.json). */
export function regionSlugForWorldSubregion(subregion: string | undefined | null): string | null {
  if (!subregion?.trim()) return null;
  const mapping = loadRegionsCountriesSeed().worldSubregionToRegionSlug;
  return mapping[subregion.trim()] ?? null;
}

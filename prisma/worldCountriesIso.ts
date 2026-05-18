import type { Country } from "world-countries";
import countries from "world-countries";

/** Every ISO-3166 alpha-2 entry shipped by `world-countries` (incl. territories). */
export function allWorldCountriesWithIso2(): Country[] {
  return countries.filter((c) => {
    const iso2 = (c.cca2 ?? "").toUpperCase();
    return iso2.length === 2 && /^[A-Z]{2}$/.test(iso2);
  });
}

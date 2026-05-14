import type { AuthenticationCountry } from "@prisma/client";
import type { FeedCountryInput } from "@/lib/authenticationFeed/types";

/** Map DB rows to feed inputs: only active + authentication-enabled; `region` line uses sub-region when present. */
export function toFeedCountryInputs(countries: AuthenticationCountry[]): FeedCountryInput[] {
  return countries
    .filter((c) => c.active && c.authenticationEnabled)
    .map((c) => ({
      id: c.id,
      iso2: c.iso2,
      countryName: c.countryName,
      region: (c.subRegion?.trim() || c.region).trim() || c.region,
      active: true,
      authenticationEnabled: true,
      percentageWeight: c.percentageWeight,
    }));
}

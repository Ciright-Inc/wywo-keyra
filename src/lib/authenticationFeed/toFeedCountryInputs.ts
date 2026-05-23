import type { AuthenticationCountry } from "@prisma/client";
import type { FeedCountryInput } from "@/lib/authenticationFeed/types";
import { shuffledCopy } from "@/lib/authenticationFeed/random";

/** Map DB rows to feed inputs: homepage panel only uses rows that are **live** (`active`) and **AUTH** (`authenticationEnabled`). `region` uses sub-region when present. */
export function toFeedCountryInputs(countries: AuthenticationCountry[]): FeedCountryInput[] {
  const eligible = countries
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
  return shuffledCopy(eligible);
}

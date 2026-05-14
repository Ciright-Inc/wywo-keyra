import { describe, expect, it } from "vitest";
import type { AuthenticationCountry } from "@prisma/client";
import { toFeedCountryInputs } from "@/lib/authenticationFeed/toFeedCountryInputs";

function row(over: Partial<AuthenticationCountry> & Pick<AuthenticationCountry, "id" | "iso2" | "countryName" | "region">): AuthenticationCountry {
  return {
    officialName: null,
    iso3: null,
    isoNumeric: null,
    subRegion: null,
    capitalCity: null,
    flagEmoji: null,
    flagAssetPath: null,
    phoneCountryCode: null,
    currencyCode: null,
    currencyName: null,
    primaryLanguage: null,
    authenticationEnabled: true,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    active: true,
    percentageWeight: 5,
    displayPriority: 0,
    ...over,
  };
}

describe("toFeedCountryInputs", () => {
  it("drops inactive and authentication-disabled rows", () => {
    const out = toFeedCountryInputs([
      row({ id: "1", iso2: "US", countryName: "United States", region: "Americas", active: false, authenticationEnabled: true }),
      row({
        id: "2",
        iso2: "IE",
        countryName: "Ireland",
        region: "Europe",
        subRegion: "Northern Europe",
        active: true,
        authenticationEnabled: false,
      }),
      row({ id: "3", iso2: "DE", countryName: "Germany", region: "Europe", active: true, authenticationEnabled: true }),
    ]);
    expect(out).toHaveLength(1);
    expect(out[0]!.iso2).toBe("DE");
  });

  it("prefers subRegion for feed region label", () => {
    const out = toFeedCountryInputs([
      row({
        id: "1",
        iso2: "IE",
        countryName: "Ireland",
        region: "Europe",
        subRegion: "Northern Europe",
        active: true,
        authenticationEnabled: true,
      }),
    ]);
    expect(out[0]!.region).toBe("Northern Europe");
  });
});

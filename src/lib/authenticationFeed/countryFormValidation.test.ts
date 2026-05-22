import { describe, expect, it } from "vitest";
import {
  authCountryFieldsFromFlagOption,
  findCountryFlagOption,
} from "@/lib/countryFlagOptions";
import {
  authCountryFormValuesFromRow,
  authCountryFormValuesToPayload,
  emptyAuthCountryFormValues,
  validateAuthCountryForm,
} from "@/lib/authenticationFeed/countryFormValidation";

describe("countryFormValidation", () => {
  it("empty form fails required fields", () => {
    const errors = validateAuthCountryForm(emptyAuthCountryFormValues());
    expect(errors.countryName).toBeTruthy();
    expect(errors.iso2).toBeTruthy();
    expect(errors.region).toBeTruthy();
  });

  it("serializes a valid form for create/update APIs", () => {
    const payload = authCountryFormValuesToPayload({
      ...emptyAuthCountryFormValues(),
      countryName: " Testland ",
      officialName: " Republic of Testland ",
      flagEmoji: "🏳️",
      iso2: "tl",
      iso3: "tst",
      region: "Europe",
      subRegion: "Northern Europe",
      phoneCountryCode: "+999",
      currencyCode: "eur",
      currencyName: " Euro ",
      percentageWeight: 7,
      displayPriority: 2,
    });

    expect(payload).toEqual({
      countryName: "Testland",
      officialName: "Republic of Testland",
      flagEmoji: "🏳️",
      iso2: "TL",
      iso3: "TST",
      region: "Europe",
      subRegion: "Northern Europe",
      phoneCountryCode: "+999",
      currencyCode: "EUR",
      currencyName: "Euro",
      active: true,
      authenticationEnabled: true,
      percentageWeight: 7,
      displayPriority: 2,
    });
  });

  it("round-trips row values through the edit form", () => {
    const row = {
      id: "row-1",
      countryName: "Ireland",
      officialName: "Republic of Ireland",
      iso2: "IE",
      iso3: "IRL",
      isoNumeric: "372",
      region: "Europe",
      subRegion: "Northern Europe",
      capitalCity: "Dublin",
      flagEmoji: "🇮🇪",
      flagAssetPath: null,
      phoneCountryCode: "+353",
      currencyCode: "EUR",
      currencyName: "Euro",
      primaryLanguage: "English",
      active: true,
      authenticationEnabled: true,
      percentageWeight: 5,
      displayPriority: 0,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const form = authCountryFormValuesFromRow(row);
    expect(validateAuthCountryForm(form)).toEqual({});
    expect(authCountryFormValuesToPayload(form).iso2).toBe("IE");
  });
});

describe("country flag autofill", () => {
  it("fills phone, currency, and names from Ireland", () => {
    const ireland = findCountryFlagOption("IE");
    expect(ireland).toBeTruthy();
    const fields = authCountryFieldsFromFlagOption(ireland!);
    expect(fields.countryName).toBe("Ireland");
    expect(fields.iso2).toBe("IE");
    expect(fields.iso3).toBe("IRL");
    expect(fields.phoneCountryCode).toBe("+353");
    expect(fields.currencyCode).toBe("EUR");
    expect(fields.currencyName).toBe("Euro");
    expect(fields.flagEmoji).toBe("🇮🇪");
  });
});

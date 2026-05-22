import type { AuthenticationCountry } from "@prisma/client";
import { DEFAULT_AUTH_COUNTRY_WEIGHT, validateCountryName, validatePercentageWeight } from "./countryPayload";

export type AuthCountryFormValues = {
  countryName: string;
  officialName: string;
  flagEmoji: string;
  iso2: string;
  iso3: string;
  region: string;
  subRegion: string;
  phoneCountryCode: string;
  currencyCode: string;
  currencyName: string;
  active: boolean;
  authenticationEnabled: boolean;
  percentageWeight: number;
  displayPriority: number;
};

export function emptyAuthCountryFormValues(): AuthCountryFormValues {
  return {
    countryName: "",
    officialName: "",
    flagEmoji: "",
    iso2: "",
    iso3: "",
    region: "",
    subRegion: "",
    phoneCountryCode: "",
    currencyCode: "",
    currencyName: "",
    active: true,
    authenticationEnabled: true,
    percentageWeight: DEFAULT_AUTH_COUNTRY_WEIGHT,
    displayPriority: 0,
  };
}

export function authCountryFormValuesFromRow(row: AuthenticationCountry): AuthCountryFormValues {
  return {
    countryName: row.countryName,
    officialName: row.officialName ?? "",
    flagEmoji: row.flagEmoji ?? "",
    iso2: row.iso2,
    iso3: row.iso3 ?? "",
    region: row.region,
    subRegion: row.subRegion ?? "",
    phoneCountryCode: row.phoneCountryCode ?? "",
    currencyCode: row.currencyCode ?? "",
    currencyName: row.currencyName ?? "",
    active: row.active,
    authenticationEnabled: row.authenticationEnabled,
    percentageWeight: row.percentageWeight,
    displayPriority: row.displayPriority,
  };
}

export function authCountryFormValuesToPayload(values: AuthCountryFormValues) {
  return {
    countryName: values.countryName.trim(),
    officialName: values.officialName.trim() || null,
    flagEmoji: values.flagEmoji.trim().slice(0, 8) || null,
    iso2: values.iso2.trim().toUpperCase(),
    iso3: values.iso3.trim() ? values.iso3.trim().toUpperCase() : null,
    region: values.region.trim(),
    subRegion: values.subRegion.trim() || null,
    phoneCountryCode: values.phoneCountryCode.trim().slice(0, 32) || null,
    currencyCode: values.currencyCode.trim() ? values.currencyCode.trim().toUpperCase().slice(0, 3) : null,
    currencyName: values.currencyName.trim() || null,
    active: values.active,
    authenticationEnabled: values.authenticationEnabled,
    percentageWeight: values.percentageWeight,
    displayPriority: Math.floor(values.displayPriority) || 0,
  };
}

export function validateAuthCountryForm(values: AuthCountryFormValues): Record<string, string> {
  const errors: Record<string, string> = {};

  const nameCheck = validateCountryName(values.countryName);
  if (nameCheck !== true) errors.countryName = nameCheck.error;

  const iso2 = values.iso2.trim().toUpperCase();
  if (iso2.length !== 2) errors.iso2 = "ISO-2 must be exactly 2 letters.";

  if (!values.region.trim()) errors.region = "Region is required.";

  const iso3 = values.iso3.trim().toUpperCase();
  if (iso3 && iso3.length !== 3) errors.iso3 = "ISO-3 must be exactly 3 letters when provided.";

  const currencyCode = values.currencyCode.trim().toUpperCase();
  if (currencyCode && currencyCode.length !== 3) {
    errors.currencyCode = "Currency code must be exactly 3 letters when provided.";
  }

  const weightCheck = validatePercentageWeight(values.percentageWeight);
  if (typeof weightCheck === "object") errors.percentageWeight = weightCheck.error;

  if (!Number.isFinite(values.displayPriority)) {
    errors.displayPriority = "Display priority must be a number.";
  }

  if (values.flagEmoji.trim().length > 8) {
    errors.flagEmoji = "Flag emoji is too long.";
  }

  if (values.phoneCountryCode.trim().length > 32) {
    errors.phoneCountryCode = "Phone code is too long.";
  }

  return errors;
}

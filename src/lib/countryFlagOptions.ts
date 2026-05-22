import countries from "world-countries";
import { flagEmojiFromIso2 } from "@/lib/deployments/flagEmoji";
import type { AuthCountryFormValues } from "@/lib/authenticationFeed/countryFormValidation";

export type CountryFlagOption = {
  iso2: string;
  iso3: string | null;
  name: string;
  officialName: string | null;
  region: string;
  subRegion: string | null;
  phoneCountryCode: string | null;
  currencyCode: string | null;
  currencyName: string | null;
  flagEmoji: string;
};

function phoneCountryCodeFromIdd(root: string, suffixes: string[]): string | null {
  const dialRoot = root.replace(/\s/g, "");
  if (!dialRoot) return null;
  const suffix = suffixes[0] ?? "";
  return `${dialRoot}${suffix}`;
}

function primaryCurrency(currencies: Record<string, { name: string; symbol: string }> | undefined): {
  code: string | null;
  name: string | null;
} {
  const entries = Object.entries(currencies ?? {});
  if (entries.length === 0) return { code: null, name: null };
  const [code, currency] = entries[0];
  return { code: code.toUpperCase(), name: currency.name ?? null };
}

export const COUNTRY_FLAG_OPTIONS: CountryFlagOption[] = countries
  .filter((country) => {
    const iso2 = (country.cca2 ?? "").toUpperCase();
    return iso2.length === 2 && /^[A-Z]{2}$/.test(iso2);
  })
  .map((country) => {
    const iso2 = country.cca2.toUpperCase();
    const currency = primaryCurrency(country.currencies);
    return {
      iso2,
      iso3: country.cca3?.toUpperCase() ?? null,
      name: country.name.common,
      officialName: country.name.official ?? null,
      region: country.region ?? "Other",
      subRegion: country.subregion ?? null,
      phoneCountryCode: phoneCountryCodeFromIdd(country.idd.root, country.idd.suffixes),
      currencyCode: currency.code,
      currencyName: currency.name,
      flagEmoji: flagEmojiFromIso2(iso2),
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));

export function findCountryFlagOption(iso2?: string, flagEmoji?: string): CountryFlagOption | null {
  const iso = iso2?.trim().toUpperCase();
  if (iso) {
    const byIso = COUNTRY_FLAG_OPTIONS.find((option) => option.iso2 === iso);
    if (byIso) return byIso;
  }
  const flag = flagEmoji?.trim();
  if (flag) {
    return COUNTRY_FLAG_OPTIONS.find((option) => option.flagEmoji === flag) ?? null;
  }
  return null;
}

export function matchesCountryFlagQuery(option: CountryFlagOption, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const phoneDigits = option.phoneCountryCode?.replace(/\D/g, "") ?? "";
  const qDigits = q.replace(/\D/g, "");
  return (
    option.name.toLowerCase().includes(q) ||
    option.officialName?.toLowerCase().includes(q) ||
    option.iso2.toLowerCase().includes(q) ||
    (option.iso3?.toLowerCase().includes(q) ?? false) ||
    option.region.toLowerCase().includes(q) ||
    (option.subRegion?.toLowerCase().includes(q) ?? false) ||
    (option.currencyCode?.toLowerCase().includes(q) ?? false) ||
    (option.currencyName?.toLowerCase().includes(q) ?? false) ||
    (option.phoneCountryCode?.toLowerCase().includes(q) ?? false) ||
    (qDigits.length > 0 && phoneDigits.includes(qDigits))
  );
}

/** Fields filled when the user picks a country flag. */
export function authCountryFieldsFromFlagOption(option: CountryFlagOption): Pick<
  AuthCountryFormValues,
  | "flagEmoji"
  | "countryName"
  | "officialName"
  | "iso2"
  | "iso3"
  | "region"
  | "subRegion"
  | "phoneCountryCode"
  | "currencyCode"
  | "currencyName"
> {
  return {
    flagEmoji: option.flagEmoji,
    countryName: option.name,
    officialName: option.officialName ?? "",
    iso2: option.iso2,
    iso3: option.iso3 ?? "",
    region: option.region,
    subRegion: option.subRegion ?? "",
    phoneCountryCode: option.phoneCountryCode ?? "",
    currencyCode: option.currencyCode ?? "",
    currencyName: option.currencyName ?? "",
  };
}

export function authCountryRowPatchFromFlagOption(option: CountryFlagOption) {
  const fields = authCountryFieldsFromFlagOption(option);
  return {
    flagEmoji: fields.flagEmoji,
    countryName: fields.countryName,
    officialName: fields.officialName || null,
    iso2: fields.iso2,
    iso3: fields.iso3 || null,
    region: fields.region,
    subRegion: fields.subRegion || null,
    phoneCountryCode: fields.phoneCountryCode || null,
    currencyCode: fields.currencyCode || null,
    currencyName: fields.currencyName || null,
  };
}

import { PHONE_COUNTRY_OPTIONS } from "@/lib/phoneCountryOptions";

export type CountryIsoOption = { code: string; name: string };

/** Distinct ISO codes from phone country list (covers Keyra global set). */
export const COUNTRY_ISO_OPTIONS: CountryIsoOption[] = PHONE_COUNTRY_OPTIONS.map(
  (c) => ({ code: c.code, name: c.name }),
).sort((a, b) => a.name.localeCompare(b.name));

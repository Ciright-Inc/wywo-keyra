import { getExampleNumber } from "libphonenumber-js";
import examples from "libphonenumber-js/mobile/examples";
import type { CountryCode } from "libphonenumber-js";
import { PHONE_COUNTRY_OPTIONS } from "@/lib/phoneCountryOptions";

export function phoneNationalPlaceholder(countryCode: string): string {
  try {
    const code = countryCode.trim().toUpperCase() as CountryCode;
    if (!PHONE_COUNTRY_OPTIONS.some((c) => c.code === code)) return "Mobile number";
    const example = getExampleNumber(code, examples);
    return example?.formatNational() ?? "Mobile number";
  } catch {
    return "Mobile number";
  }
}

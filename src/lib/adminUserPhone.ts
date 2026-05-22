import { parsePhoneNumberFromString } from "libphonenumber-js";
import {
  combinePhoneParts,
  DEFAULT_PHONE_COUNTRY_CODE,
  dialForPhoneCountryCode,
  PHONE_COUNTRY_OPTIONS,
} from "@/lib/phoneCountryOptions";

const VALID_PHONE_COUNTRY_CODES = new Set(PHONE_COUNTRY_OPTIONS.map((c) => c.code));

export function parsePhoneE164(phoneE164: string | null | undefined): {
  phoneCountryCode: string;
  national: string;
} {
  if (!phoneE164?.trim()) {
    return { phoneCountryCode: DEFAULT_PHONE_COUNTRY_CODE, national: "" };
  }

  const normalized = phoneE164.trim().startsWith("+")
    ? phoneE164.trim()
    : `+${phoneE164.replace(/\D/g, "")}`;

  const parsed = parsePhoneNumberFromString(normalized);
  if (parsed?.country && VALID_PHONE_COUNTRY_CODES.has(parsed.country)) {
    return {
      phoneCountryCode: parsed.country,
      national: parsed.nationalNumber,
    };
  }

  const digits = normalized.replace(/\D/g, "");
  const sorted = [...PHONE_COUNTRY_OPTIONS].sort(
    (a, b) => b.dial.replace(/\D/g, "").length - a.dial.replace(/\D/g, "").length,
  );

  for (const opt of sorted) {
    const dialDigits = opt.dial.replace(/\D/g, "");
    if (digits.startsWith(dialDigits)) {
      return { phoneCountryCode: opt.code, national: digits.slice(dialDigits.length) };
    }
  }

  return { phoneCountryCode: DEFAULT_PHONE_COUNTRY_CODE, national: digits };
}

export function phoneE164FromParts(phoneCountryCode: string, phoneNational: string): string {
  const dial = dialForPhoneCountryCode(phoneCountryCode);
  return combinePhoneParts(dial, phoneNational);
}

export function normalizePhoneE164(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("+") ? trimmed : `+${trimmed.replace(/\D/g, "")}`;
}

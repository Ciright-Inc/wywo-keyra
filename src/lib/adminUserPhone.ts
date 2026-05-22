import {
  combinePhoneParts,
  DEFAULT_PHONE_COUNTRY_CODE,
  dialForPhoneCountryCode,
  PHONE_COUNTRY_OPTIONS,
} from "@/lib/phoneCountryOptions";

export function parsePhoneE164(phoneE164: string | null | undefined): {
  phoneCountryCode: string;
  national: string;
} {
  if (!phoneE164?.trim()) {
    return { phoneCountryCode: DEFAULT_PHONE_COUNTRY_CODE, national: "" };
  }

  const digits = phoneE164.replace(/\D/g, "");
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

import { parsePhoneNumberFromString } from "libphonenumber-js";

/**
 * Normalize a freeform phone string to strict E.164.
 *
 * Uses libphonenumber-js `isValid()` (country-aware, full metadata) as the
 * sole gate. Accepts every well-formed number for every supported country
 * (USA, India, UK, IE, DE, FR, …) in any reasonable input shape — with or
 * without `+`, with spaces / parens / dashes, leading national-trunk `0`s,
 * etc. Rejects clearly malformed numbers (too few digits, US area codes
 * starting with `0`, gibberish, etc.) and returns `null` so callers can
 * surface a "invalid phone number" error.
 */
export function toE164(raw: string | null | undefined, defaultCountry?: string): string | null {
  if (!raw) return null;
  const trimmed = String(raw).trim();
  if (!trimmed) return null;
  const candidate = trimmed.startsWith("+") ? trimmed : `+${trimmed.replace(/\D/g, "")}`;
  const parsed = parsePhoneNumberFromString(
    candidate,
    defaultCountry as Parameters<typeof parsePhoneNumberFromString>[1],
  );
  if (parsed?.isValid()) return parsed.number;
  return null;
}

export function safeE164(raw: string | null | undefined): string {
  return toE164(raw) ?? "";
}

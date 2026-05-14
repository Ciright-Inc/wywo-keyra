/** Shared validation for admin authentication country payloads. */

export const DEFAULT_AUTH_COUNTRY_WEIGHT = 5;

export function normalizeIso2(raw: string): string {
  return raw.trim().toUpperCase();
}

export function normalizeIso3(raw: string): string {
  return raw.trim().toUpperCase();
}

export function validatePercentageWeight(value: unknown): number | { error: string } {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return { error: "percentageWeight must be a finite number." };
  }
  if (value <= 0) {
    return { error: "percentageWeight must be greater than zero." };
  }
  return value;
}

export function validateCountryName(name: string): true | { error: string } {
  const t = name.trim();
  if (!t) return { error: "countryName is required." };
  if (t.length > 200) return { error: "countryName is too long." };
  return true;
}

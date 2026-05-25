/** Client-safe sort order validation (no Prisma / server-only). */

export function parseMaterialSortOrder(value: unknown): { sortOrder: number } | { error: string } {
  if (value === undefined || value === null) {
    return { error: "Sort order is required." };
  }

  let numeric: number;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return { error: "Sort order is required." };
    if (!/^\d+$/.test(trimmed)) {
      return { error: "Sort order must be a whole number (no decimals)." };
    }
    numeric = Number(trimmed);
  } else if (typeof value === "number") {
    numeric = value;
  } else {
    return { error: "Sort order must be a valid number." };
  }

  if (!Number.isFinite(numeric) || !Number.isInteger(numeric)) {
    return { error: "Sort order must be a whole number (no decimals)." };
  }

  if (numeric < 1) {
    return { error: "Sort order must be 1 or greater." };
  }

  return { sortOrder: numeric };
}

import type { DeploymentStatus } from "@prisma/client";

export function parseDeploymentStatus(value: unknown): DeploymentStatus | null {
  if (value === "IDENTIFIED") return "IDENTIFIED";
  if (value === "INSTITUTIONAL_AWARENESS") return "INSTITUTIONAL_AWARENESS";
  if (value === "TVIP") return "TVIP";
  if (value === "OPERATIONAL") return "OPERATIONAL";
  return null;
}

export function parseBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

export function parseIntOrNull(value: unknown): number | null | undefined {
  if (value === null) return null;
  if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value);
  if (typeof value === "string" && value.trim().length) {
    const n = Number.parseInt(value, 10);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

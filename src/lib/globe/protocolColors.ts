import type { GlobePulseEvent } from "@/lib/globe/types";

export const PRIMARY_RED = "#E53935";
export const PRIMARY_BLUE = "#1565FF";
export const PRIMARY_GREEN = "#00C853";
export const PRIMARY_YELLOW = "#FFD600";

const PROTOCOL_COLORS: Record<string, string> = {
  legacy: PRIMARY_RED,
  otp: PRIMARY_YELLOW,
  "sat-id": PRIMARY_GREEN,
  "sat-iam": PRIMARY_BLUE,
  "sat-mfa": PRIMARY_RED,
  "sat-sig": PRIMARY_YELLOW,
  sat: PRIMARY_GREEN,
};

function normalizeProtocolKey(event: GlobePulseEvent): string {
  const module = String(event.satModule ?? event.protocolCode ?? "").toLowerCase().trim();
  const authType = String(event.authType ?? "").toLowerCase().trim();

  if (module.includes("otp") || authType === "legacy") return "otp";
  if (module.includes("sat-id") || module === "id") return "sat-id";
  if (module.includes("sat-iam") || module.includes("iam")) return "sat-iam";
  if (module.includes("sat-mfa") || module.includes("mfa")) return "sat-mfa";
  if (module.includes("sat-sig") || module.includes("sig")) return "sat-sig";
  if (authType === "sat") return "sat";
  return "sat";
}

export function getProtocolColor(event: GlobePulseEvent): string {
  const key = normalizeProtocolKey(event);
  return PROTOCOL_COLORS[key] ?? PRIMARY_GREEN;
}

export const PROTOCOL_DOT_COLORS = [
  PRIMARY_GREEN,
  PRIMARY_BLUE,
  PRIMARY_RED,
  PRIMARY_YELLOW,
] as const;

/**
 * Category filter options for admin UI (matches `SAT_PROTOCOL_REGISTRY` categories).
 * Kept separate from `registry.ts` so client pages avoid bundling the full protocol catalog.
 */
export const SAT_PROTOCOL_CATEGORIES = [
  "Administration",
  "AI Security",
  "API Security",
  "Audit & Compliance",
  "Authentication",
  "Authorization",
  "Communications",
  "Credential Security",
  "CRM Security",
  "Data Governance",
  "Device Security",
  "Event Architecture",
  "Identity",
  "Identity Verification",
  "Interoperability",
  "Payments",
  "Recovery & Continuity",
  "Session Management",
  "Trust Engine",
].sort((a, b) => a.localeCompare(b));

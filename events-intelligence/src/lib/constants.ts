import type {
  Continent,
  GeopoliticalRegion,
  Industry,
  SatCoreProblem,
} from "@prisma/client";

export const REGION_ORDER: GeopoliticalRegion[] = [
  "NORTH_AMERICA",
  "WESTERN_EUROPE",
  "EASTERN_EUROPE_BALKANS_CAUCASUS",
  "MIDDLE_EAST_GCC",
  "SOUTH_ASIA",
  "SOUTHEAST_ASIA",
  "EAST_ASIA",
  "LATIN_AMERICA",
  "CARIBBEAN",
  "AFRICA",
  "OCEANIA",
];

export const REGION_LABELS: Record<GeopoliticalRegion, string> = {
  NORTH_AMERICA: "North America",
  WESTERN_EUROPE: "Western Europe",
  EASTERN_EUROPE_BALKANS_CAUCASUS: "Eastern Europe / Balkans / Caucasus",
  MIDDLE_EAST_GCC: "Middle East / GCC",
  SOUTH_ASIA: "South Asia",
  SOUTHEAST_ASIA: "Southeast Asia",
  EAST_ASIA: "East Asia",
  LATIN_AMERICA: "Latin America",
  CARIBBEAN: "Caribbean",
  AFRICA: "Africa",
  OCEANIA: "Oceania",
};

export const REGION_SLUGS: Record<GeopoliticalRegion, string> = {
  NORTH_AMERICA: "north-america",
  WESTERN_EUROPE: "western-europe",
  EASTERN_EUROPE_BALKANS_CAUCASUS: "eastern-europe-balkans-caucasus",
  MIDDLE_EAST_GCC: "middle-east-gcc",
  SOUTH_ASIA: "south-asia",
  SOUTHEAST_ASIA: "southeast-asia",
  EAST_ASIA: "east-asia",
  LATIN_AMERICA: "latin-america",
  CARIBBEAN: "caribbean",
  AFRICA: "africa",
  OCEANIA: "oceania",
};

export const SLUG_TO_REGION: Record<string, GeopoliticalRegion> = Object.fromEntries(
  (Object.keys(REGION_SLUGS) as GeopoliticalRegion[]).map((k) => [REGION_SLUGS[k], k]),
) as Record<string, GeopoliticalRegion>;

export const CONTINENT_LABELS: Record<Continent, string> = {
  NORTH_AMERICA: "North America",
  SOUTH_AMERICA: "South America",
  EUROPE: "Europe",
  ASIA: "Asia",
  AFRICA: "Africa",
  OCEANIA: "Oceania",
  MIDDLE_EAST: "Middle East",
};

/** Stable ordering for filters & admin selects */
export const CONTINENT_ORDER: Continent[] = [
  "NORTH_AMERICA",
  "SOUTH_AMERICA",
  "EUROPE",
  "MIDDLE_EAST",
  "ASIA",
  "AFRICA",
  "OCEANIA",
];

export const INDUSTRY_ORDER: Industry[] = [
  "CYBERSECURITY",
  "DIGITAL_IDENTITY",
  "TELECOM",
  "FINTECH",
  "AI",
  "CLOUD",
  "APP_SECURITY",
  "DEVELOPER_PLATFORMS",
  "DIGITAL_GOVERNMENT",
  "INTERNET_GOVERNANCE",
  "MOBILE_INFRASTRUCTURE",
  "PAYMENTS",
  "BANKING",
  "SMART_CITIES",
  "IOT",
  "CRITICAL_INFRASTRUCTURE",
];

export const INDUSTRY_LABELS: Record<Industry, string> = {
  CYBERSECURITY: "Cybersecurity",
  DIGITAL_IDENTITY: "Digital identity",
  TELECOM: "Telecom",
  FINTECH: "Fintech",
  AI: "AI",
  CLOUD: "Cloud",
  APP_SECURITY: "App security",
  DEVELOPER_PLATFORMS: "Developer platforms",
  DIGITAL_GOVERNMENT: "Digital government",
  INTERNET_GOVERNANCE: "Internet governance",
  MOBILE_INFRASTRUCTURE: "Mobile infrastructure",
  PAYMENTS: "Payments",
  BANKING: "Banking",
  SMART_CITIES: "Smart cities",
  IOT: "IoT",
  CRITICAL_INFRASTRUCTURE: "Critical infrastructure",
};

export const INDUSTRY_SLUGS: Record<Industry, string> = {
  CYBERSECURITY: "cybersecurity",
  DIGITAL_IDENTITY: "digital-identity",
  TELECOM: "telecom",
  FINTECH: "fintech",
  AI: "ai",
  CLOUD: "cloud",
  APP_SECURITY: "app-security",
  DEVELOPER_PLATFORMS: "developer-platforms",
  DIGITAL_GOVERNMENT: "digital-government",
  INTERNET_GOVERNANCE: "internet-governance",
  MOBILE_INFRASTRUCTURE: "mobile-infrastructure",
  PAYMENTS: "payments",
  BANKING: "banking",
  SMART_CITIES: "smart-cities",
  IOT: "iot",
  CRITICAL_INFRASTRUCTURE: "critical-infrastructure",
};

export const SLUG_TO_INDUSTRY: Record<string, Industry> = Object.fromEntries(
  (Object.keys(INDUSTRY_SLUGS) as Industry[]).map((k) => [INDUSTRY_SLUGS[k], k]),
) as Record<string, Industry>;

export const SAT_LABELS: Record<SatCoreProblem, string> = {
  ACCOUNT_TAKEOVER: "Account takeover",
  PASSWORDLESS_AUTHENTICATION: "Passwordless authentication",
  WEAK_MFA: "Weak MFA",
  SIM_SWAP: "SIM swap fraud",
  DEVICE_TRUST: "Device trust",
  APP_FRAUD: "App login fraud",
  BANKING_FRAUD: "Banking transaction fraud",
  GOVERNMENT_ACCESS: "Government portal access risk",
  TELECOM_SUBSCRIBER_VERIFICATION: "Telecom subscriber verification",
  ROAMING_AUTHENTICATION: "Roaming identity trust",
  AI_AGENT_IDENTITY: "AI agent identity risk",
  ZERO_TRUST: "Zero-trust access enforcement",
  DEVELOPER_AUTHENTICATION: "Developer authentication burden",
};

export const SAT_SLUGS: Record<SatCoreProblem, string> = {
  ACCOUNT_TAKEOVER: "account-takeover",
  PASSWORDLESS_AUTHENTICATION: "passwordless-authentication",
  WEAK_MFA: "weak-mfa",
  SIM_SWAP: "sim-swap",
  DEVICE_TRUST: "device-trust",
  APP_FRAUD: "app-fraud",
  BANKING_FRAUD: "banking-fraud",
  GOVERNMENT_ACCESS: "government-access",
  TELECOM_SUBSCRIBER_VERIFICATION: "telecom-subscriber-verification",
  ROAMING_AUTHENTICATION: "roaming-authentication",
  AI_AGENT_IDENTITY: "ai-agent-identity",
  ZERO_TRUST: "zero-trust",
  DEVELOPER_AUTHENTICATION: "developer-authentication",
};

export const SLUG_TO_SAT: Record<string, SatCoreProblem> = Object.fromEntries(
  (Object.keys(SAT_SLUGS) as SatCoreProblem[]).map((k) => [SAT_SLUGS[k], k]),
) as Record<string, SatCoreProblem>;

export const TIER_LABELS = {
  TIER_1: "Tier 1 — Global strategic",
  TIER_2: "Tier 2 — Regional high-value",
  TIER_3: "Tier 3 — Niche / local",
} as const;

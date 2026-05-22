import "server-only";

import type { AuthenticationCountry, Prisma, SatProtocol } from "@prisma/client";
import prisma from "@/lib/prisma";
import { ensureDefaultFeedSettings } from "@/lib/authenticationFeed/feedSessionDb";

export type AuthenticationCountriesListParams = {
  region?: string;
  subRegion?: string;
  active?: "" | "true" | "false";
  authenticationEnabled?: "" | "true" | "false";
  weightMin?: string;
  weightMax?: string;
  q?: string;
  sort?: string;
};

export type SatProtocolsListParams = {
  q?: string;
  category?: string;
  active?: "all" | "true" | "false";
  sort?: string | null;
};

const AUTH_COUNTRY_LIST_SELECT = {
  id: true,
  countryName: true,
  officialName: true,
  iso2: true,
  iso3: true,
  isoNumeric: true,
  region: true,
  subRegion: true,
  capitalCity: true,
  flagEmoji: true,
  phoneCountryCode: true,
  currencyCode: true,
  currencyName: true,
  primaryLanguage: true,
  active: true,
  authenticationEnabled: true,
  percentageWeight: true,
  displayPriority: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.AuthenticationCountrySelect;

const SAT_PROTOCOL_LIST_SELECT = {
  id: true,
  protocolName: true,
  protocolCode: true,
  protocolSlug: true,
  protocolCategory: true,
  active: true,
  percentageWeight: true,
  protocolUrlEnabled: true,
  protocolUrl: true,
  allowProtocolLink: true,
  homePercentage: true,
  roamingPercentage: true,
  securityClassification: true,
  flagEnterprise: true,
  flagGovernment: true,
  flagTelco: true,
  flagConsumer: true,
  flagAiAgent: true,
  displayOrder: true,
  iconKey: true,
  colorTheme: true,
  trustLevel: true,
  riskReductionScore: true,
  globalAvailability: true,
  apiReady: true,
  auditRequired: true,
  consentRequired: true,
  zeroKnowledgeCompatible: true,
  simOrEsimRequired: true,
  deviceBindingRequired: true,
  createdBySystem: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.SatProtocolSelect;

const SORT_FIELDS = new Set([
  "displayOrder",
  "protocolName",
  "protocolCode",
  "protocolCategory",
  "percentageWeight",
  "trustLevel",
  "updatedAt",
  "active",
  "homePercentage",
  "roamingPercentage",
]);

function buildAuthenticationCountriesOrderBy(
  sort: string,
): Prisma.AuthenticationCountryOrderByWithRelationInput[] {
  const normalized = sort.trim().toLowerCase();
  if (normalized === "weight" || normalized === "percentage") {
    return [{ percentageWeight: "desc" }, { countryName: "asc" }];
  }
  if (normalized === "name" || normalized === "country") {
    return [{ countryName: "asc" }];
  }
  if (normalized === "iso" || normalized === "iso2") {
    return [{ iso2: "asc" }];
  }
  if (normalized === "updated") {
    return [{ updatedAt: "desc" }];
  }
  return [{ displayPriority: "asc" }, { countryName: "asc" }];
}

function buildAuthenticationCountriesWhere(params: AuthenticationCountriesListParams): Prisma.AuthenticationCountryWhereInput {
  const q = params.q?.trim().toLowerCase() ?? "";
  const weightMin = params.weightMin?.trim() ? Number(params.weightMin) : null;
  const weightMax = params.weightMax?.trim() ? Number(params.weightMax) : null;

  const where: Prisma.AuthenticationCountryWhereInput = {
    ...(params.region ? { region: params.region } : {}),
    ...(params.subRegion ? { subRegion: params.subRegion } : {}),
    ...(params.active === "true" ? { active: true } : {}),
    ...(params.active === "false" ? { active: false } : {}),
    ...(params.authenticationEnabled === "true" ? { authenticationEnabled: true } : {}),
    ...(params.authenticationEnabled === "false" ? { authenticationEnabled: false } : {}),
    ...(q
      ? {
          OR: [
            { countryName: { contains: q, mode: "insensitive" } },
            { officialName: { contains: q, mode: "insensitive" } },
            { iso2: { contains: q, mode: "insensitive" } },
            { iso3: { contains: q, mode: "insensitive" } },
            { region: { contains: q, mode: "insensitive" } },
            { subRegion: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  if (weightMin != null && Number.isFinite(weightMin) && weightMax != null && Number.isFinite(weightMax)) {
    where.percentageWeight = { gte: weightMin, lte: weightMax };
  } else if (weightMin != null && Number.isFinite(weightMin)) {
    where.percentageWeight = { gte: weightMin };
  } else if (weightMax != null && Number.isFinite(weightMax)) {
    where.percentageWeight = { lte: weightMax };
  }

  return where;
}

function parseSatProtocolOrderBy(raw: string | null | undefined): Prisma.SatProtocolOrderByWithRelationInput {
  const s = raw?.trim() ?? "displayOrder:asc";
  const [k0, d0] = s.split(":");
  const dir = d0 === "desc" ? "desc" : "asc";
  const key = SORT_FIELDS.has(k0) ? k0 : "displayOrder";
  return { [key]: dir } as Prisma.SatProtocolOrderByWithRelationInput;
}

function buildSatProtocolsWhere(params: SatProtocolsListParams): Prisma.SatProtocolWhereInput {
  const q = params.q?.trim() ?? "";
  const category = params.category?.trim() ?? "";

  return {
    ...(params.active === "true" ? { active: true } : {}),
    ...(params.active === "false" ? { active: false } : {}),
    ...(category ? { protocolCategory: category } : {}),
    ...(q
      ? {
          OR: [
            { protocolName: { contains: q, mode: "insensitive" } },
            { protocolCode: { contains: q, mode: "insensitive" } },
            { protocolCategory: { contains: q, mode: "insensitive" } },
            { protocolSlug: { contains: q, mode: "insensitive" } },
            { securityClassification: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}

export async function listAuthenticationCountriesForAdmin(
  params: AuthenticationCountriesListParams = {},
): Promise<AuthenticationCountry[]> {
  return prisma.authenticationCountry.findMany({
    where: buildAuthenticationCountriesWhere(params),
    orderBy: buildAuthenticationCountriesOrderBy(params.sort ?? "priority"),
    select: AUTH_COUNTRY_LIST_SELECT,
  }) as Promise<AuthenticationCountry[]>;
}

export async function listSatProtocolsForAdmin(params: SatProtocolsListParams = {}): Promise<SatProtocol[]> {
  return prisma.satProtocol.findMany({
    where: buildSatProtocolsWhere(params),
    orderBy: parseSatProtocolOrderBy(params.sort),
    select: SAT_PROTOCOL_LIST_SELECT,
  }) as Promise<SatProtocol[]>;
}

export async function getAuthenticationFeedSettingsForAdmin() {
  await ensureDefaultFeedSettings();
  return prisma.authenticationFeedSetting.findUnique({ where: { id: "default" } });
}

export function parseAuthenticationCountriesSearchParams(
  sp: URLSearchParams,
): AuthenticationCountriesListParams {
  return {
    region: sp.get("region")?.trim() || undefined,
    subRegion: sp.get("subRegion")?.trim() || undefined,
    active: (sp.get("active")?.trim() as AuthenticationCountriesListParams["active"]) || undefined,
    authenticationEnabled:
      (sp.get("authenticationEnabled")?.trim() as AuthenticationCountriesListParams["authenticationEnabled"]) ||
      undefined,
    weightMin: sp.get("weightMin")?.trim() || undefined,
    weightMax: sp.get("weightMax")?.trim() || undefined,
    q: sp.get("q")?.trim() || undefined,
    sort: sp.get("sort")?.trim() || undefined,
  };
}

export function parseSatProtocolsSearchParams(sp: URLSearchParams): SatProtocolsListParams {
  const activeRaw = sp.get("active")?.trim();
  return {
    q: sp.get("q")?.trim() || undefined,
    category: sp.get("category")?.trim() || undefined,
    active: activeRaw === "true" || activeRaw === "false" ? activeRaw : "all",
    sort: sp.get("sort")?.trim() || null,
  };
}

import type {
  Continent,
  EventTier,
  GeopoliticalRegion,
  Industry,
  Prisma,
  SatCoreProblem,
} from "@prisma/client";
import { Industry as IndustryEnum } from "@prisma/client";
import { INDUSTRY_LABELS } from "@/lib/constants";

const INDUSTRY_ENUM_SET = new Set<string>(Object.values(IndustryEnum));

export type EventListSort =
  | "startDate"
  | "priorityScore"
  | "satCoreFit"
  | "attendees"
  | "yearsRunning"
  | "country"
  | "city"
  | "region"
  | "industry"
  | "identity"
  | "telecom"
  | "banking"
  | "government"
  | "cybersecurity"
  | "appSecurity"
  | "ai";

export function parseIndustryList(raw: string | null): Industry[] | undefined {
  if (!raw?.trim()) return undefined;
  const parts = raw.split(",").map((s) => s.trim().toUpperCase());
  return parts.filter(Boolean) as Industry[];
}

export function parseSatList(raw: string | null): SatCoreProblem[] | undefined {
  if (!raw?.trim()) return undefined;
  const parts = raw.split(",").map((s) => s.trim().toUpperCase());
  return parts.filter(Boolean) as SatCoreProblem[];
}

/** Calendar month filter `YYYY-MM` on event start date (UTC month boundaries). */
export function applyMonthFilter(where: Prisma.EventWhereInput, month: string | null | undefined) {
  if (!month?.trim()) return;
  const parts = month.trim().split("-").map(Number);
  if (parts.length !== 2 || parts.some((n) => Number.isNaN(n))) return;
  const [y, mo] = parts;
  if (mo < 1 || mo > 12) return;
  const start = new Date(Date.UTC(y, mo - 1, 1));
  const end = new Date(Date.UTC(y, mo, 1));
  where.startDate = { gte: start, lt: end };
}

export function buildEventWhere(input: {
  q?: string | null;
  region?: string | null;
  continent?: string | null;
  country?: string | null;
  city?: string | null;
  industries?: Industry[];
  satProblems?: SatCoreProblem[];
  tier?: string | null;
  month?: string | null;
  featuredOnly?: boolean;
  /** public default: only catalogue-approved events */
  approvedFilter?: "public" | "all" | "pending";
}): Prisma.EventWhereInput {
  const where: Prisma.EventWhereInput = {};

  if (!input.approvedFilter || input.approvedFilter === "public") {
    where.approvedPublic = true;
  } else if (input.approvedFilter === "pending") {
    where.approvedPublic = false;
  }

  if (input.featuredOnly) where.featured = true;

  if (input.q?.trim()) {
    where.name = { contains: input.q.trim(), mode: "insensitive" };
  }

  if (input.region?.trim()) {
    where.geopoliticalRegion = input.region.trim() as GeopoliticalRegion;
  }

  if (input.continent?.trim()) {
    where.continent = input.continent.trim() as Continent;
  }

  if (input.country?.trim()) {
    where.country = { equals: input.country.trim(), mode: "insensitive" };
  }

  if (input.city?.trim()) {
    where.city = { equals: input.city.trim(), mode: "insensitive" };
  }

  if (input.tier?.trim()) {
    where.tier = input.tier.trim() as EventTier;
  }

  if (input.industries?.length) {
    where.industries = { some: { industry: { in: input.industries } } };
  }

  if (input.satProblems?.length) {
    where.satCoreProblems = { some: { problem: { in: input.satProblems } } };
  }

  applyMonthFilter(where, input.month);

  return where;
}

export function mergeIndustryFilters(
  list: Industry[] | undefined,
  single: string | null | undefined,
): Industry[] | undefined {
  const v = single?.trim().toUpperCase();
  const extra = v && INDUSTRY_ENUM_SET.has(v) ? (v as Industry) : undefined;
  if (!extra && (!list || list.length === 0)) return list;
  const acc = new Set<Industry>(list ?? []);
  if (extra) acc.add(extra);
  const out = [...acc];
  return out.length ? out : undefined;
}

export function buildEventOrderBy(
  sort: EventListSort | null,
): Prisma.EventOrderByWithRelationInput[] {
  switch (sort) {
    case "priorityScore":
    case "satCoreFit":
      return [{ keyraPriorityScore: "desc" }, { startDate: "asc" }, { id: "asc" }];
    case "attendees":
      return [{ estimatedAttendees: "desc" }, { startDate: "asc" }, { id: "asc" }];
    case "yearsRunning":
      return [{ yearsRunning: "desc" }, { startDate: "asc" }, { id: "asc" }];
    case "country":
      return [{ country: "asc" }, { startDate: "asc" }, { id: "asc" }];
    case "city":
      return [{ city: "asc" }, { startDate: "asc" }, { id: "asc" }];
    case "region":
      return [{ geopoliticalRegion: "asc" }, { startDate: "asc" }, { id: "asc" }];
    case "industry":
      return [{ startDate: "asc" }, { id: "asc" }];
    case "identity":
      return [{ identityRelevance: "desc" }, { startDate: "asc" }, { id: "asc" }];
    case "telecom":
      return [{ telecomRelevance: "desc" }, { startDate: "asc" }, { id: "asc" }];
    case "banking":
      return [{ bankingRelevance: "desc" }, { startDate: "asc" }, { id: "asc" }];
    case "government":
      return [{ governmentRelevance: "desc" }, { startDate: "asc" }, { id: "asc" }];
    case "cybersecurity":
      return [{ cybersecurityRelevance: "desc" }, { startDate: "asc" }, { id: "asc" }];
    case "appSecurity":
      return [{ appSecurityRelevance: "desc" }, { startDate: "asc" }, { id: "asc" }];
    case "ai":
      return [{ aiRelevance: "desc" }, { startDate: "asc" }, { id: "asc" }];
    case "startDate":
    default:
      return [{ startDate: "asc" }, { id: "asc" }];
  }
}

/** Post-sort when Prisma cannot order by relation label (industry lane). */
export function finalizeEventSort<
  T extends { id: string; industries: { industry: Industry }[] },
>(events: T[], sort: EventListSort | null): T[] {
  if (sort !== "industry") return events;
  return [...events].sort((a, b) => {
    const la =
      [...a.industries.map((x) => INDUSTRY_LABELS[x.industry])].sort()[0] ?? "\uFFFF";
    const lb =
      [...b.industries.map((x) => INDUSTRY_LABELS[x.industry])].sort()[0] ?? "\uFFFF";
    return la.localeCompare(lb);
  });
}

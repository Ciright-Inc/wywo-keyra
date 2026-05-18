import type {
  Continent,
  EventTier,
  GeopoliticalRegion,
  Industry,
  Prisma,
  SatCoreProblem,
} from "@prisma/client";

export type EventListSort =
  | "startDate"
  | "priorityScore"
  | "attendees"
  | "yearsRunning"
  | "country"
  | "city"
  | "region"
  | "identity"
  | "telecom"
  | "banking"
  | "government"
  | "cybersecurity"
  | "appSecurity";

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

export function buildEventWhere(input: {
  q?: string | null;
  region?: string | null;
  continent?: string | null;
  country?: string | null;
  city?: string | null;
  industries?: Industry[];
  satProblems?: SatCoreProblem[];
  tier?: string | null;
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

  return where;
}

export function buildEventOrderBy(
  sort: EventListSort | null,
): Prisma.EventOrderByWithRelationInput[] {
  switch (sort) {
    case "priorityScore":
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
    case "startDate":
    default:
      return [{ startDate: "asc" }, { id: "asc" }];
  }
}

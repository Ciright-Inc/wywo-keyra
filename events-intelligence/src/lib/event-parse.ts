import type {
  Continent,
  EventTier,
  GeopoliticalRegion,
  Industry,
  Prisma,
  SatCoreProblem,
  VerificationStatus,
} from "@prisma/client";
import { Industry as IndustryValues, SatCoreProblem as SatValues } from "@prisma/client";
import { computeKeyraPriorityScore } from "@/lib/scoring";
import { slugify } from "@/lib/slug";

function enumValues<T extends Record<string, string>>(e: T): Set<string> {
  return new Set(Object.values(e));
}

const INDUSTRY_SET = enumValues(IndustryValues);
const SAT_SET = enumValues(SatValues);

export function parseIndustries(raw: unknown): Industry[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is Industry => typeof x === "string" && INDUSTRY_SET.has(x));
}

export function parseSatCoreProblems(raw: unknown): SatCoreProblem[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is SatCoreProblem => typeof x === "string" && SAT_SET.has(x));
}

export function scoreFromScalars(data: Partial<Prisma.EventUncheckedCreateInput>): number {
  return computeKeyraPriorityScore({
    identityRelevance: data.identityRelevance ?? 0,
    telecomRelevance: data.telecomRelevance ?? 0,
    bankingRelevance: data.bankingRelevance ?? 0,
    governmentRelevance: data.governmentRelevance ?? 0,
    appSecurityRelevance: data.appSecurityRelevance ?? 0,
    estimatedAttendees: data.estimatedAttendees ?? null,
    yearsRunning: data.yearsRunning ?? null,
  });
}

export async function uniqueSlug(
  tx: Prisma.TransactionClient,
  base: string,
  excludeId?: string,
): Promise<string> {
  const root = slugify(base) || "event";
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? root : `${root}-${i + 1}`;
    const clash = await tx.event.findFirst({
      where: excludeId ? { slug: candidate, NOT: { id: excludeId } } : { slug: candidate },
      select: { id: true },
    });
    if (!clash) return candidate;
  }
  return `${root}-${Date.now()}`;
}

export function parseAdminEventScalars(body: Record<string, unknown>): Partial<Prisma.EventUncheckedCreateInput> & {
  name?: string;
  geopoliticalRegion?: GeopoliticalRegion;
  continent?: Continent;
  country?: string;
  city?: string;
  startDate?: Date;
  endDate?: Date;
} {
  const out: Partial<Prisma.EventUncheckedCreateInput> & {
    name?: string;
    geopoliticalRegion?: GeopoliticalRegion;
    continent?: Continent;
    country?: string;
    city?: string;
    startDate?: Date;
    endDate?: Date;
  } = {};

  if (typeof body.name === "string") out.name = body.name.trim();

  if (typeof body.slug === "string" && body.slug.trim()) out.slug = body.slug.trim();

  if (typeof body.parentEventBrand === "string") out.parentEventBrand = body.parentEventBrand;
  if (typeof body.eventCategory === "string") out.eventCategory = body.eventCategory;

  if (typeof body.geopoliticalRegion === "string") {
    out.geopoliticalRegion = body.geopoliticalRegion as GeopoliticalRegion;
  }
  if (typeof body.continent === "string") out.continent = body.continent as Continent;

  if (typeof body.country === "string") out.country = body.country.trim();
  if (typeof body.city === "string") out.city = body.city.trim();
  if (typeof body.venue === "string") out.venue = body.venue;

  if (typeof body.startDate === "string") out.startDate = new Date(body.startDate);
  if (typeof body.endDate === "string") out.endDate = new Date(body.endDate);

  if (typeof body.eventAgeYears === "number") out.eventAgeYears = body.eventAgeYears;
  if (typeof body.yearsRunning === "number") out.yearsRunning = body.yearsRunning;

  if (typeof body.estimatedAttendees === "number") out.estimatedAttendees = body.estimatedAttendees;
  if (typeof body.estimatedExhibitors === "number") out.estimatedExhibitors = body.estimatedExhibitors;
  if (typeof body.estimatedSpeakers === "number") out.estimatedSpeakers = body.estimatedSpeakers;

  if (typeof body.governmentAttendance === "boolean") out.governmentAttendance = body.governmentAttendance;
  if (typeof body.carrierAttendance === "boolean") out.carrierAttendance = body.carrierAttendance;
  if (typeof body.bankingFintechAttendance === "boolean")
    out.bankingFintechAttendance = body.bankingFintechAttendance;
  if (typeof body.developerAttendance === "boolean") out.developerAttendance = body.developerAttendance;

  const num = (k: keyof typeof body) =>
    typeof body[k] === "number" ? (body[k] as number) : undefined;

  const ri = num("cybersecurityRelevance");
  if (ri !== undefined) out.cybersecurityRelevance = ri;
  const ii = num("identityRelevance");
  if (ii !== undefined) out.identityRelevance = ii;
  const ti = num("telecomRelevance");
  if (ti !== undefined) out.telecomRelevance = ti;
  const ai = num("aiRelevance");
  if (ai !== undefined) out.aiRelevance = ai;
  const ap = num("appSecurityRelevance");
  if (ap !== undefined) out.appSecurityRelevance = ap;

  const gv = num("governmentRelevance");
  if (gv !== undefined) out.governmentRelevance = gv;
  const bk = num("bankingRelevance");
  if (bk !== undefined) out.bankingRelevance = bk;

  if (typeof body.keyraPriorityScore === "number") out.keyraPriorityScore = body.keyraPriorityScore;

  if (typeof body.recommendedAction === "string") out.recommendedAction = body.recommendedAction;
  if (typeof body.targetMeetingType === "string") out.targetMeetingType = body.targetMeetingType;

  if (typeof body.primaryBuyerPersona === "string") out.primaryBuyerPersona = body.primaryBuyerPersona;
  if (typeof body.secondaryBuyerPersona === "string")
    out.secondaryBuyerPersona = body.secondaryBuyerPersona;

  if (Array.isArray(body.targetCompanies)) {
    out.targetCompanies = body.targetCompanies.filter((x): x is string => typeof x === "string");
  }
  if (Array.isArray(body.targetMinistries)) {
    out.targetMinistries = body.targetMinistries.filter((x): x is string => typeof x === "string");
  }
  if (Array.isArray(body.targetCarriers)) {
    out.targetCarriers = body.targetCarriers.filter((x): x is string => typeof x === "string");
  }
  if (Array.isArray(body.targetBanks)) {
    out.targetBanks = body.targetBanks.filter((x): x is string => typeof x === "string");
  }

  if (typeof body.summary === "string") out.summary = body.summary;
  if (typeof body.whyItMatters === "string") out.whyItMatters = body.whyItMatters;
  if (typeof body.whoAttends === "string") out.whoAttends = body.whoAttends;
  if (typeof body.problemKeyraSolves === "string") out.problemKeyraSolves = body.problemKeyraSolves;
  if (typeof body.satCoreAlignment === "string") out.satCoreAlignment = body.satCoreAlignment;
  if (typeof body.targetMeetingList === "string") out.targetMeetingList = body.targetMeetingList;

  if (typeof body.eventWebsite === "string") out.eventWebsite = body.eventWebsite;
  if (typeof body.sourceUrl === "string") out.sourceUrl = body.sourceUrl;

  if (typeof body.verificationStatus === "string") {
    out.verificationStatus = body.verificationStatus as VerificationStatus;
  }
  if (typeof body.tier === "string") out.tier = body.tier as EventTier;
  if (typeof body.approvedPublic === "boolean") out.approvedPublic = body.approvedPublic;
  if (typeof body.featured === "boolean") out.featured = body.featured;
  if (typeof body.keyraOwner === "string") out.keyraOwner = body.keyraOwner;

  return out;
}

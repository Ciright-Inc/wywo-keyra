import type { Continent, GeopoliticalRegion, Industry } from "@prisma/client";
import { EventTier as TierEnum } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { EventPayload } from "@/lib/event-json";

const include = { industries: true, satCoreProblems: true } as const;

export async function getFeaturedEvents(take = 8): Promise<EventPayload[]> {
  return prisma.event.findMany({
    where: { approvedPublic: true, featured: true },
    orderBy: [{ keyraPriorityScore: "desc" }, { startDate: "asc" }],
    take,
    include,
  });
}

export async function getEventsByRegion(
  region: GeopoliticalRegion,
  take = 60,
): Promise<EventPayload[]> {
  return prisma.event.findMany({
    where: { approvedPublic: true, geopoliticalRegion: region },
    orderBy: [{ startDate: "asc" }],
    take,
    include,
  });
}

export async function getPriorityEvents(take = 40): Promise<EventPayload[]> {
  return prisma.event.findMany({
    where: { approvedPublic: true, tier: TierEnum.TIER_1 },
    orderBy: [{ keyraPriorityScore: "desc" }],
    take,
    include,
  });
}

export async function getEventBySlug(slug: string): Promise<EventPayload | null> {
  return prisma.event.findFirst({
    where: { slug, approvedPublic: true },
    include,
  });
}

export async function getEventsByIndustry(industry: Industry, take = 60): Promise<EventPayload[]> {
  return prisma.event.findMany({
    where: {
      approvedPublic: true,
      industries: { some: { industry } },
    },
    orderBy: [{ keyraPriorityScore: "desc" }, { startDate: "asc" }],
    take,
    include,
  });
}

export async function getEventsByContinent(
  continent: Continent,
  take = 80,
): Promise<EventPayload[]> {
  return prisma.event.findMany({
    where: { approvedPublic: true, continent },
    orderBy: [{ startDate: "asc" }],
    take,
    include,
  });
}

import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toPublicEventJson } from "@/lib/event-json";
import { isAdmin } from "@/lib/admin-auth";
import { SLUG_TO_REGION } from "@/lib/constants";
import {
  buildEventOrderBy,
  buildEventWhere,
  finalizeEventSort,
  mergeIndustryFilters,
  type EventListSort,
  parseIndustryList,
  parseSatList,
} from "@/lib/event-query";
import {
  parseAdminEventScalars,
  parseIndustries,
  parseSatCoreProblems,
  scoreFromScalars,
  uniqueSlug,
} from "@/lib/event-parse";

async function requireAdmin() {
  const ok = await isAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

export async function GET(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const regionRaw = searchParams.get("region");
  const regionResolved = regionRaw?.trim()
    ? SLUG_TO_REGION[regionRaw.trim()] ?? regionRaw.trim()
    : null;
  const continent = searchParams.get("continent");
  const country = searchParams.get("country");
  const city = searchParams.get("city");
  const tier = searchParams.get("tier");
  const month = searchParams.get("month");
  const featuredOnly = searchParams.get("featured") === "1";
  const pendingOnly = searchParams.get("pending") === "1";
  const industries = mergeIndustryFilters(
    parseIndustryList(searchParams.get("industries")),
    searchParams.get("industry"),
  );
  const satProblems = parseSatList(searchParams.get("sat"));

  const sort = (searchParams.get("sort") ?? "startDate") as EventListSort;
  const limit = Math.min(200, Math.max(1, Number(searchParams.get("limit") ?? "100")));

  const where = buildEventWhere({
    q,
    region: regionResolved,
    continent,
    country,
    city,
    tier,
    month,
    industries,
    satProblems,
    featuredOnly,
    approvedFilter: pendingOnly ? "pending" : "all",
  });

  const orderBy = buildEventOrderBy(sort);

  const rows = finalizeEventSort(
    await prisma.event.findMany({
      where,
      orderBy,
      take: limit,
      include: { industries: true, satCoreProblems: true },
    }),
    sort,
  );

  return NextResponse.json({ events: rows.map(toPublicEventJson) });
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const scalars = parseAdminEventScalars(b);

  if (
    !scalars.name ||
    !scalars.geopoliticalRegion ||
    !scalars.continent ||
    !scalars.country ||
    !scalars.city ||
    !scalars.startDate ||
    !scalars.endDate
  ) {
    return NextResponse.json(
      {
        error:
          "Missing required fields: name, geopoliticalRegion, continent, country, city, startDate, endDate",
      },
      { status: 400 },
    );
  }

  if (Number.isNaN(scalars.startDate.getTime()) || Number.isNaN(scalars.endDate.getTime())) {
    return NextResponse.json({ error: "Invalid dates" }, { status: 400 });
  }

  const industries = parseIndustries(b.industries);
  const satCoreProblems = parseSatCoreProblems(b.satCoreProblems);

  const slug = await prisma.$transaction(async (tx) => {
    const base =
      scalars.slug && scalars.slug.trim().length > 1 ? scalars.slug.trim() : scalars.name!;
    return uniqueSlug(tx, base);
  });

  const baseData = {
    ...scalars,
    slug,
  };

  const keyraPriorityScore = scoreFromScalars(baseData);

  const created = await prisma.event.create({
    data: {
      ...(baseData as Prisma.EventUncheckedCreateInput),
      keyraPriorityScore,
      industries: {
        create: industries.map((industry) => ({ industry })),
      },
      satCoreProblems: {
        create: satCoreProblems.map((problem) => ({ problem })),
      },
    },
    include: { industries: true, satCoreProblems: true },
  });

  return NextResponse.json({ event: toPublicEventJson(created) });
}

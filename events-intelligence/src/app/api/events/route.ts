import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toPublicEventJson } from "@/lib/event-json";
import {
  buildEventOrderBy,
  buildEventWhere,
  finalizeEventSort,
  mergeIndustryFilters,
  type EventListSort,
  parseIndustryList,
  parseSatList,
} from "@/lib/event-query";
import { isAdmin } from "@/lib/admin-auth";
import { SLUG_TO_REGION } from "@/lib/constants";

function resolveRegion(raw: string | null): string | null {
  if (!raw?.trim()) return null;
  const slug = raw.trim();
  return SLUG_TO_REGION[slug] ?? slug;
}

export async function GET(req: Request) {
  const admin = await isAdmin();
  const { searchParams } = new URL(req.url);

  const q = searchParams.get("q");
  const regionRaw = searchParams.get("region");
  const continent = searchParams.get("continent");
  const country = searchParams.get("country");
  const city = searchParams.get("city");
  const tier = searchParams.get("tier");
  const month = searchParams.get("month");
  const featuredOnly = searchParams.get("featured") === "1";
  const industries = mergeIndustryFilters(
    parseIndustryList(searchParams.get("industries")),
    searchParams.get("industry"),
  );
  const satProblems = parseSatList(searchParams.get("sat"));

  const sort = (searchParams.get("sort") ?? "startDate") as EventListSort;
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "40")));
  const cursorParam = searchParams.get("cursor");
  const industrySort = sort === "industry";
  const useCursor = Boolean(cursorParam && !industrySort);

  const region = resolveRegion(regionRaw);

  const where = buildEventWhere({
    q,
    region,
    continent,
    country,
    city,
    tier,
    month,
    industries,
    satProblems,
    featuredOnly,
    approvedFilter: admin ? "all" : "public",
  });

  const orderBy = buildEventOrderBy(sort);

  const rows = await prisma.event.findMany({
    where,
    orderBy,
    take: limit + 1,
    ...(useCursor ? { skip: 1, cursor: { id: cursorParam! } } : {}),
    include: { industries: true, satCoreProblems: true },
  });

  let nextCursor: string | null = null;
  let list = rows;
  if (rows.length > limit) {
    const next = rows.pop();
    nextCursor = industrySort ? null : next?.id ?? null;
    list = rows;
  }

  list = finalizeEventSort(list, sort);

  return NextResponse.json({
    events: list.map(toPublicEventJson),
    nextCursor,
  });
}

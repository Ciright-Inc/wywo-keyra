import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toPublicEventJson } from "@/lib/event-json";
import {
  buildEventOrderBy,
  buildEventWhere,
  type EventListSort,
  parseIndustryList,
  parseSatList,
} from "@/lib/event-query";
import { isAdmin } from "@/lib/admin-auth";

export async function GET(req: Request) {
  const admin = await isAdmin();
  const { searchParams } = new URL(req.url);

  const q = searchParams.get("q");
  const region = searchParams.get("region");
  const continent = searchParams.get("continent");
  const country = searchParams.get("country");
  const city = searchParams.get("city");
  const tier = searchParams.get("tier");
  const featuredOnly = searchParams.get("featured") === "1";
  const industries = parseIndustryList(searchParams.get("industries"));
  const satProblems = parseSatList(searchParams.get("sat"));

  const sort = (searchParams.get("sort") ?? "startDate") as EventListSort;
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "40")));
  const cursor = searchParams.get("cursor");

  const where = buildEventWhere({
    q,
    region,
    continent,
    country,
    city,
    tier,
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
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    include: { industries: true, satCoreProblems: true },
  });

  let nextCursor: string | null = null;
  let list = rows;
  if (rows.length > limit) {
    const next = rows.pop();
    nextCursor = next?.id ?? null;
    list = rows;
  }

  return NextResponse.json({
    events: list.map(toPublicEventJson),
    nextCursor,
  });
}

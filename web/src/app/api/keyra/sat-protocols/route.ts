import { rateLimitResponse } from "@/app/api/keyra/_routeHelpers";
import prisma from "@/lib/prisma";
import { isPostgresDatabaseUrlConfigured } from "@/lib/postgresEnv";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Public list of SAT protocols marked On (active) in admin. */
export async function GET(req: Request) {
  const limited = rateLimitResponse(req, "keyra-sat-protocols-public-list");
  if (limited) return limited;

  if (!isPostgresDatabaseUrlConfigured()) {
    return NextResponse.json({ error: "Unavailable." }, { status: 503 });
  }

  const protocols = await prisma.satProtocol.findMany({
    where: { active: true },
    orderBy: [{ displayOrder: "asc" }, { protocolName: "asc" }],
    select: {
      protocolCode: true,
      protocolName: true,
      protocolCategory: true,
      colorTheme: true,
      iconKey: true,
    },
  });

  return NextResponse.json(
    { protocols },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } },
  );
}

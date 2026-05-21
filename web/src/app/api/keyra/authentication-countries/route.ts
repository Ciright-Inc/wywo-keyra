import { rateLimitResponse } from "@/app/api/keyra/_routeHelpers";
import prisma from "@/lib/prisma";
import { isPostgresDatabaseUrlConfigured } from "@/lib/postgresEnv";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Public list of authentication countries marked Active in admin. */
export async function GET(req: Request) {
  const limited = rateLimitResponse(req, "keyra-auth-countries-public-list");
  if (limited) return limited;

  if (!isPostgresDatabaseUrlConfigured()) {
    return NextResponse.json({ error: "Unavailable." }, { status: 503 });
  }

  const countries = await prisma.authenticationCountry.findMany({
    where: { active: true },
    orderBy: [{ displayPriority: "desc" }, { countryName: "asc" }],
    select: {
      iso2: true,
      countryName: true,
      region: true,
      subRegion: true,
      flagEmoji: true,
    },
  });

  return NextResponse.json(
    { countries },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } },
  );
}

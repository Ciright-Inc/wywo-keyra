import { rateLimitResponse } from "@/app/api/keyra/_routeHelpers";
import { writeAudit } from "@/app/api/admin/deployments/_audit";
import { DEFAULT_AUTH_COUNTRY_WEIGHT } from "@/lib/authenticationFeed/countryPayload";
import { requireGlobalFeedWrite } from "@/lib/authenticationFeed/adminGuard";
import { requireDeploymentAuth } from "@/lib/deployments/adminContext";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** POST — set `percentageWeight` to default (5) for all authentication countries. */
export async function POST(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const denied = requireGlobalFeedWrite(auth);
  if (denied) return denied;

  const limited = rateLimitResponse(req, "admin-auth-countries-reset-weight");
  if (limited) return limited;

  const result = await prisma.authenticationCountry.updateMany({
    data: { percentageWeight: DEFAULT_AUTH_COUNTRY_WEIGHT },
  });

  await writeAudit({
    entityType: "AuthenticationCountry",
    entityId: "reset-weighting",
    action: "reset_weighting",
    payload: { updatedCount: result.count, percentageWeight: DEFAULT_AUTH_COUNTRY_WEIGHT },
  });

  return NextResponse.json({ updated: result.count, percentageWeight: DEFAULT_AUTH_COUNTRY_WEIGHT });
}

import { readJsonObject, rateLimitResponse } from "@/app/api/keyra/_routeHelpers";
import { writeAudit } from "@/app/api/admin/deployments/_audit";
import { requireGlobalFeedWrite } from "@/lib/authenticationFeed/adminGuard";
import { requireDeploymentAuth } from "@/lib/deployments/adminContext";
import prisma from "@/lib/prisma";
import { validateHomeRoaming } from "@/lib/satProtocol/validateHomeRoaming";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const denied = requireGlobalFeedWrite(auth);
  if (denied) return denied;

  const limited = rateLimitResponse(req, "admin-sat-protocols-weights-patch");
  if (limited) return limited;

  const body = await readJsonObject(req);
  const ids = Array.isArray(body.ids) ? body.ids.filter((x): x is string => typeof x === "string") : [];
  const all = body.all === true;

  const percentageWeight =
    typeof body.percentageWeight === "number" && Number.isFinite(body.percentageWeight)
      ? body.percentageWeight
      : undefined;
  const homePercentage =
    typeof body.homePercentage === "number" && Number.isFinite(body.homePercentage)
      ? body.homePercentage
      : undefined;
  const roamingPercentage =
    typeof body.roamingPercentage === "number" && Number.isFinite(body.roamingPercentage)
      ? body.roamingPercentage
      : undefined;

  if (percentageWeight === undefined && homePercentage === undefined && roamingPercentage === undefined) {
    return NextResponse.json(
      { error: "Provide percentageWeight and/or homePercentage and/or roamingPercentage." },
      { status: 400 },
    );
  }

  const where = all ? {} : ids.length ? { id: { in: ids } } : null;
  if (!where) {
    return NextResponse.json({ error: "Provide ids array or all: true." }, { status: 400 });
  }

  const targets = await prisma.satProtocol.findMany({ where });
  if (!targets.length) {
    return NextResponse.json({ error: "No matching protocols." }, { status: 404 });
  }

  for (const row of targets) {
    const nextH = homePercentage ?? row.homePercentage;
    const nextR = roamingPercentage ?? row.roamingPercentage;
    const hrErr = validateHomeRoaming(nextH, nextR);
    if (hrErr) {
      return NextResponse.json({ error: `${hrErr} (protocol ${row.protocolCode})` }, { status: 400 });
    }
    await prisma.satProtocol.update({
      where: { id: row.id },
      data: {
        ...(percentageWeight !== undefined ? { percentageWeight } : {}),
        ...(homePercentage !== undefined ? { homePercentage } : {}),
        ...(roamingPercentage !== undefined ? { roamingPercentage } : {}),
      },
    });
  }

  await writeAudit({
    entityType: "SatProtocol",
    entityId: "bulk-weights",
    action: "bulk_update_weights",
    payload: { count: targets.length, percentageWeight, homePercentage, roamingPercentage, all, ids },
  });

  return NextResponse.json({ ok: true, updated: targets.length });
}

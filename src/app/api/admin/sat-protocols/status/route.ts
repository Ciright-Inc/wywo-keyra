import { readJsonObject, rateLimitResponse } from "@/app/api/keyra/_routeHelpers";
import { writeAudit } from "@/app/api/admin/deployments/_audit";
import { requireGlobalFeedWrite } from "@/lib/authenticationFeed/adminGuard";
import { requireDeploymentAuth } from "@/lib/deployments/adminContext";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const denied = requireGlobalFeedWrite(auth);
  if (denied) return denied;

  const limited = rateLimitResponse(req, "admin-sat-protocols-status-patch");
  if (limited) return limited;

  const body = await readJsonObject(req);
  const ids = Array.isArray(body.ids) ? body.ids.filter((x): x is string => typeof x === "string") : [];
  const all = body.all === true;
  if (typeof body.active !== "boolean") {
    return NextResponse.json({ error: "active (boolean) is required." }, { status: 400 });
  }

  const where = all ? {} : ids.length ? { id: { in: ids } } : null;
  if (!where) {
    return NextResponse.json({ error: "Provide ids array or all: true." }, { status: 400 });
  }

  const res = await prisma.satProtocol.updateMany({
    where,
    data: { active: body.active },
  });

  await writeAudit({
    entityType: "SatProtocol",
    entityId: "bulk-status",
    action: "bulk_update_status",
    payload: { count: res.count, active: body.active, all, ids },
  });

  return NextResponse.json({ ok: true, updated: res.count });
}

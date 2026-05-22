import { readJsonObject, rateLimitResponse } from "@/app/api/keyra/_routeHelpers";
import { writeAudit } from "@/app/api/admin/deployments/_audit";
import { requireGlobalFeedWrite } from "@/lib/authenticationFeed/adminGuard";
import { getAuthenticationFeedSettingsForAdmin } from "@/lib/authenticationFeed/adminListQueries";
import { ensureDefaultFeedSettings } from "@/lib/authenticationFeed/feedSessionDb";
import { requireDeploymentAuth } from "@/lib/deployments/adminContext";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;

  const row = await getAuthenticationFeedSettingsForAdmin();
  return NextResponse.json({ settings: row });
}

export async function PATCH(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const denied = requireGlobalFeedWrite(auth);
  if (denied) return denied;

  const limited = rateLimitResponse(req, "admin-auth-feed-settings-patch");
  if (limited) return limited;

  await ensureDefaultFeedSettings();
  const body = await readJsonObject(req);
  const before = await prisma.authenticationFeedSetting.findUnique({ where: { id: "default" } });
  const data: Record<string, unknown> = {};

  if (typeof body.feedEnabled === "boolean") data.feedEnabled = body.feedEnabled;
  if (typeof body.initialRecordsCount === "number" && Number.isFinite(body.initialRecordsCount)) {
    data.initialRecordsCount = Math.max(1, Math.min(200, Math.floor(body.initialRecordsCount)));
  }
  if (typeof body.batchSize === "number" && Number.isFinite(body.batchSize)) {
    data.batchSize = Math.max(1, Math.min(200, Math.floor(body.batchSize)));
  }
  if (typeof body.fetchThreshold === "number" && Number.isFinite(body.fetchThreshold)) {
    data.fetchThreshold = Math.max(1, Math.min(199, Math.floor(body.fetchThreshold)));
  }
  if (typeof body.sessionUniquenessLimit === "number" && Number.isFinite(body.sessionUniquenessLimit)) {
    data.sessionUniquenessLimit = Math.max(50, Math.min(20_000, Math.floor(body.sessionUniquenessLimit)));
  }
  if (typeof body.maskingEnabled === "boolean") data.maskingEnabled = body.maskingEnabled;
  if (typeof body.obfuscationEnabled === "boolean") data.obfuscationEnabled = body.obfuscationEnabled;
  if (typeof body.maxRecordsPerSession === "number" && Number.isFinite(body.maxRecordsPerSession)) {
    data.maxRecordsPerSession = Math.max(50, Math.min(500_000, Math.floor(body.maxRecordsPerSession)));
  }
  if (typeof body.animationSpeedMs === "number" && Number.isFinite(body.animationSpeedMs)) {
    data.animationSpeedMs = Math.max(50, Math.min(10_000, Math.floor(body.animationSpeedMs)));
  }
  if (typeof body.refreshBehavior === "string") {
    const rb = body.refreshBehavior.trim();
    if (rb === "append" || rb === "replace") data.refreshBehavior = rb;
  }
  if (typeof body.defaultRegionWeightPreset === "string") {
    data.defaultRegionWeightPreset = body.defaultRegionWeightPreset.trim() || null;
  }

  const updated = await prisma.authenticationFeedSetting.update({
    where: { id: "default" },
    data: data as never,
  });

  await writeAudit({
    entityType: "AuthenticationFeedSetting",
    entityId: "default",
    action: "update",
    payload: { before, patch: data },
  });

  return NextResponse.json({ settings: updated });
}

import { rateLimitResponse } from "@/app/api/keyra/_routeHelpers";
import { feedBrowserGuard } from "@/lib/authenticationFeed/feedBrowserGuard";
import { generateLatestAuthBatch } from "@/lib/authenticationFeed/generate";
import {
  createAuthenticationFeedSession,
  KEYRA_FEED_SESSION_COOKIE,
  updateSessionAfterBatch,
} from "@/lib/authenticationFeed/feedSessionDb";
import { loadFeedGenerationAssets } from "@/lib/authenticationFeed/loadAssets";
import { toFeedCountryInputs } from "@/lib/authenticationFeed/toFeedCountryInputs";
import { toFeedProtocolInputs } from "@/lib/authenticationFeed/toFeedProtocolInputs";
import { fingerprintFromRequest } from "@/lib/authenticationFeed/mask";
import { wrapPublicFeedJson } from "@/lib/authenticationFeed/publicFeedPayload";
import {
  buildDemoSessionPayload,
  getDemoLatestAuthRecords,
  isServerFeedDemoMode,
} from "@/lib/authenticationFeed/demoLatestAuthFeed";
import { isPostgresDatabaseUrlConfigured } from "@/lib/postgresEnv";
import { verifyTurnstileIfConfigured } from "@/lib/turnstileVerify";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const blocked = feedBrowserGuard(req);
  if (blocked) return blocked;

  const limited = rateLimitResponse(req, "keyra-latest-auth-session");
  if (limited) return limited;

  if (!isPostgresDatabaseUrlConfigured()) {
    return NextResponse.json(
      { feedEnabled: false, records: [], message: "Feed requires a configured Postgres database." },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  }

  const { settings, countries, protocols } = await loadFeedGenerationAssets();
  if (!settings?.feedEnabled) {
    return NextResponse.json(
      { feedEnabled: false, records: [], message: "Feed is disabled." },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  }

  const reqUrl = new URL(req.url);
  const turnstileToken = reqUrl.searchParams.get("turnstileToken") ?? undefined;
  const captcha = await verifyTurnstileIfConfigured(turnstileToken);
  if (!captcha.ok) {
    return NextResponse.json(
      { error: captcha.error ?? "Captcha verification failed." },
      { status: 400, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  const fp = fingerprintFromRequest(req);
  const { sessionUuid, expiresAt } = await createAuthenticationFeedSession(fp);

  const countryInputs = toFeedCountryInputs(countries);
  const protocolInputs = toFeedProtocolInputs(protocols);

  const max = settings.maxRecordsPerSession;
  const initial = Math.min(settings.initialRecordsCount, settings.batchSize, max);
  const pairs = new Set<string>();
  const { records, poolResetCount } = generateLatestAuthBatch({
    countries: countryInputs,
    protocols: protocolInputs,
    limit: initial,
    uniquenessLimit: settings.sessionUniquenessLimit,
    maskingEnabled: settings.maskingEnabled,
    pairsUsed: pairs,
  });

  await updateSessionAfterBatch({
    sessionUuid,
    pairsUsed: pairs,
    renderedDelta: records.length,
    uniquenessEpochDelta: poolResetCount,
  });

  const inner: Record<string, unknown> = {
    feedEnabled: true,
    records,
    nextCursor: 1,
    expiresAt: expiresAt.toISOString(),
    animationSpeedMs: settings.animationSpeedMs,
    fetchThreshold: settings.fetchThreshold,
    batchSize: settings.batchSize,
  };
  const payload = wrapPublicFeedJson({
    obfuscationEnabled: settings.obfuscationEnabled,
    sessionUuid,
    inner,
  });

  const res = NextResponse.json(payload);
  res.headers.set("Cache-Control", "private, no-store, max-age=0");
  res.cookies.set({
    name: KEYRA_FEED_SESSION_COOKIE,
    value: sessionUuid,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}

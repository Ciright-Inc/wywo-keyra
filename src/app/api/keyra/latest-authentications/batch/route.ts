import { rateLimitResponse } from "@/app/api/keyra/_routeHelpers";
import { feedBrowserGuard } from "@/lib/authenticationFeed/feedBrowserGuard";
import { generateLatestAuthBatch } from "@/lib/authenticationFeed/generate";
import {
  getAuthenticationFeedSession,
  KEYRA_FEED_SESSION_COOKIE,
  pairsUsedFromJson,
  updateSessionAfterBatch,
} from "@/lib/authenticationFeed/feedSessionDb";
import { loadFeedGenerationAssets } from "@/lib/authenticationFeed/loadAssets";
import { toFeedCountryInputs } from "@/lib/authenticationFeed/toFeedCountryInputs";
import { wrapPublicFeedJson } from "@/lib/authenticationFeed/publicFeedPayload";
import { isPostgresDatabaseUrlConfigured } from "@/lib/postgresEnv";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const blocked = feedBrowserGuard(req);
  if (blocked) return blocked;

  const limited = rateLimitResponse(req, "keyra-latest-auth-batch");
  if (limited) return limited;

  if (!isPostgresDatabaseUrlConfigured()) {
    return NextResponse.json(
      { feedEnabled: false, records: [], message: "Feed requires a configured Postgres database." },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  }

  const url = new URL(req.url);
  const cursor = Number(url.searchParams.get("cursor") ?? "");
  if (!Number.isFinite(cursor) || cursor < 1) {
    return NextResponse.json({ error: "cursor must be a positive integer." }, { status: 400 });
  }

  const jar = await cookies();
  const sessionUuid = jar.get(KEYRA_FEED_SESSION_COOKIE)?.value;
  if (!sessionUuid) {
    return NextResponse.json({ error: "Missing feed session cookie." }, { status: 401 });
  }

  const session = await getAuthenticationFeedSession(sessionUuid);
  if (!session) {
    return NextResponse.json({ error: "Session expired. Refresh the feed." }, { status: 401 });
  }

  const { settings, countries, protocols } = await loadFeedGenerationAssets();
  if (!settings?.feedEnabled) {
    return NextResponse.json({ feedEnabled: false, records: [] });
  }

  const remaining = settings.maxRecordsPerSession - session.renderedCount;
  if (remaining <= 0) {
    return NextResponse.json(
      { feedEnabled: true, records: [], done: true, nextCursor: cursor },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  }

  const limit = Math.min(settings.batchSize, remaining);
  const pairs = pairsUsedFromJson(session.pairsUsedJson);

  const countryInputs = toFeedCountryInputs(countries);
  const protocolInputs = protocols.map((p) => ({
    id: p.id,
    protocolCode: p.protocolCode,
    protocolName: p.protocolName,
    protocolCategory: p.protocolCategory,
    active: p.active,
    percentageWeight: p.percentageWeight,
    homePercentage: p.homePercentage,
    roamingPercentage: p.roamingPercentage,
  }));

  const { records, poolResetCount } = generateLatestAuthBatch({
    countries: countryInputs,
    protocols: protocolInputs,
    limit,
    uniquenessLimit: settings.sessionUniquenessLimit,
    maskingEnabled: settings.maskingEnabled,
    pairsUsed: pairs,
  });

  const nextRendered = session.renderedCount + records.length;

  await updateSessionAfterBatch({
    sessionUuid,
    pairsUsed: pairs,
    renderedDelta: records.length,
    uniquenessEpochDelta: poolResetCount,
  });

  const inner: Record<string, unknown> = {
    feedEnabled: true,
    records,
    nextCursor: cursor + 1,
    done: nextRendered >= settings.maxRecordsPerSession,
  };
  const payload = wrapPublicFeedJson({
    obfuscationEnabled: settings.obfuscationEnabled,
    sessionUuid,
    inner,
  });

  return NextResponse.json(payload, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
}

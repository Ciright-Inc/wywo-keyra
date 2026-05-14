import { readJsonObject, rateLimitResponse } from "@/app/api/keyra/_routeHelpers";
import { feedBrowserGuard } from "@/lib/authenticationFeed/feedBrowserGuard";
import {
  getAuthenticationFeedSession,
  KEYRA_FEED_SESSION_COOKIE,
} from "@/lib/authenticationFeed/feedSessionDb";
import { unsealFeedPayload } from "@/lib/authenticationFeed/publicFeedPayload";
import { isPostgresDatabaseUrlConfigured } from "@/lib/postgresEnv";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function validateInner(kind: string, inner: Record<string, unknown>): string | null {
  if (typeof inner.feedEnabled !== "boolean") return "Malformed payload.";
  if (!Array.isArray(inner.records)) return "Malformed payload.";
  if (typeof inner.nextCursor !== "number" || !Number.isFinite(inner.nextCursor)) return "Malformed payload.";
  if (inner.done !== undefined && typeof inner.done !== "boolean") return "Malformed payload.";
  if (kind === "session" && inner.feedEnabled === true) {
    if (typeof inner.expiresAt !== "string") return "Malformed payload.";
  }
  return null;
}

export async function POST(req: Request) {
  const blocked = feedBrowserGuard(req);
  if (blocked) return blocked;

  const limited = rateLimitResponse(req, "keyra-latest-auth-unseal");
  if (limited) return limited;

  if (!isPostgresDatabaseUrlConfigured()) {
    return NextResponse.json({ error: "Unavailable." }, { status: 503 });
  }

  const body = await readJsonObject(req);
  const blob = typeof body.blob === "string" ? body.blob.trim() : "";
  const kind = typeof body.kind === "string" ? body.kind.trim() : "session";
  if (!blob) {
    return NextResponse.json({ error: "blob is required." }, { status: 400 });
  }
  if (kind !== "session" && kind !== "batch") {
    return NextResponse.json({ error: "kind must be session or batch." }, { status: 400 });
  }

  const jar = await cookies();
  const sessionUuid = jar.get(KEYRA_FEED_SESSION_COOKIE)?.value;
  if (!sessionUuid) {
    return NextResponse.json({ error: "Missing feed session cookie." }, { status: 401 });
  }

  const session = await getAuthenticationFeedSession(sessionUuid);
  if (!session) {
    return NextResponse.json({ error: "Session expired." }, { status: 401 });
  }

  let inner: Record<string, unknown>;
  try {
    inner = unsealFeedPayload(sessionUuid, blob);
  } catch {
    return NextResponse.json({ error: "Invalid sealed payload." }, { status: 400 });
  }

  const err = validateInner(kind, inner);
  if (err) {
    return NextResponse.json({ error: err }, { status: 400 });
  }

  return NextResponse.json(inner, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
}

import {
  honeypotTripped,
  rateLimitResponse,
  readJsonObject,
} from "@/app/api/keyra/_routeHelpers";
import { addTrustedLocation } from "@/lib/keyraProtection";
import { requireKeyraSessionUser } from "@/lib/keyraProtectionSession";
import { isPostgresDatabaseUrlConfigured } from "@/lib/postgresEnv";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const limited = rateLimitResponse(req, "keyra-protection-location");
  if (limited) return limited;

  const user = await requireKeyraSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  if (!isPostgresDatabaseUrlConfigured()) {
    return NextResponse.json(
      { error: "Locations require a configured database." },
      { status: 503 },
    );
  }

  const body = await readJsonObject(req);
  if (honeypotTripped(body)) {
    return NextResponse.json({ ok: true });
  }

  const label = typeof body.label === "string" ? body.label.trim() : "";
  if (!label) {
    return NextResponse.json({ error: "Location label is required." }, { status: 400 });
  }

  const row = await addTrustedLocation(user.phoneE164, label);
  return NextResponse.json({ ok: true, id: row.id });
}

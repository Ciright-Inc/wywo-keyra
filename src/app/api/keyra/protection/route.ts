import { rateLimitResponse } from "@/app/api/keyra/_routeHelpers";
import {
  buildProtectionDashboard,
  fetchAuthSessionSnapshot,
} from "@/lib/keyraProtection";
import { requireKeyraSessionUser } from "@/lib/keyraProtectionSession";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const limited = rateLimitResponse(req, "keyra-protection");
  if (limited) return limited;

  const user = await requireKeyraSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const auth = await fetchAuthSessionSnapshot(req);
  let dashboard;
  try {
    dashboard = await buildProtectionDashboard(user.phoneE164, user, auth, req);
  } catch (err) {
    console.error("[GET /api/keyra/protection]", err);
    return NextResponse.json(
      {
        error:
          "Protection data is not ready. Run `npx prisma migrate deploy` in the keyra folder.",
      },
      { status: 503 },
    );
  }

  return NextResponse.json(dashboard, {
    headers: { "Cache-Control": "private, no-store" },
  });
}

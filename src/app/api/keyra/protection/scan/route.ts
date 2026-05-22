import { rateLimitResponse } from "@/app/api/keyra/_routeHelpers";
import { runIdentityScan } from "@/lib/keyraProtection";
import { requireKeyraSessionUser } from "@/lib/keyraProtectionSession";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const limited = rateLimitResponse(req, "keyra-protection-scan");
  if (limited) return limited;

  const user = await requireKeyraSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { scannedAt } = await runIdentityScan(user.phoneE164);
  return NextResponse.json({
    ok: true,
    scannedAt: scannedAt.toISOString(),
    status: "clear",
  });
}

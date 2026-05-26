import { NextResponse } from "next/server";
import type { WywoTrustStatus } from "@prisma/client";
import { resolveWywoActorFromRequest } from "@/lib/wywo/auth";
import { listAdminMessages } from "@/lib/wywo/messages";

export const dynamic = "force-dynamic";

const STATUSES: WywoTrustStatus[] = [
  "TRUSTED",
  "FAMILY_CIRCLE",
  "EXECUTIVE_RING",
  "REFERRED",
  "PENDING_REVIEW",
  "UNKNOWN",
  "BLOCKED",
  "SUPPRESSED",
  "EXPIRED",
  "REVOKED",
];

export async function GET(req: Request) {
  const actor = await resolveWywoActorFromRequest(req);
  if (!actor?.isAdmin) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const url = new URL(req.url);
  const trustStatus = url.searchParams.get("trustStatus");
  const out = await listAdminMessages({
    worldId: url.searchParams.get("worldId") || undefined,
    subscriptionId: url.searchParams.get("subscriptionId") || undefined,
    phone: url.searchParams.get("phone") || undefined,
    query: url.searchParams.get("q") || undefined,
    trustStatus:
      trustStatus && STATUSES.includes(trustStatus as WywoTrustStatus)
        ? (trustStatus as WywoTrustStatus)
        : undefined,
    page: Number(url.searchParams.get("page") || "1") || 1,
    perPage: Math.min(Number(url.searchParams.get("perPage") || "50") || 50, 200),
  });
  return NextResponse.json({ ok: true, ...out });
}

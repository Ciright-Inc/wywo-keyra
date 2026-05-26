import { NextResponse } from "next/server";
import { resolveWywoActorFromRequest } from "@/lib/wywo/auth";
import { listAuditLogs } from "@/lib/wywo/audit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const actor = await resolveWywoActorFromRequest(req);
  if (!actor?.isAdmin) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const url = new URL(req.url);
  const rows = await listAuditLogs({
    messageId: url.searchParams.get("messageId") || undefined,
    actorPhone: url.searchParams.get("actorPhone") || undefined,
    action: url.searchParams.get("action") || undefined,
    limit: Number(url.searchParams.get("limit") || "200") || 200,
  });
  return NextResponse.json({ ok: true, rows });
}

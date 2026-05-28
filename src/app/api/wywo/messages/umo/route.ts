import { NextResponse } from "next/server";
import { withWywoActor } from "@/lib/wywo/apiHelpers";
import { listWywoMessages } from "@/lib/wywo/messages";
import type { WywoSourceType, WywoTrustRing, WywoTrustStatus } from "@prisma/client";
import { umoFromWywoMessageView } from "@/lib/wywo/umo";
import { WYWO_SOURCE_TYPE_LABELS, WYWO_TRUST_RING_LABELS, WYWO_TRUST_STATUS_LABELS } from "@/lib/wywo/constants";

export const dynamic = "force-dynamic";

type Direction = "inbox" | "sent" | "all";

export async function GET(req: Request) {
  return withWywoActor(req, async (actor) => {
    const url = new URL(req.url);

    const direction = (url.searchParams.get("direction") || "inbox") as Direction;
    const pendingTrust = url.searchParams.get("pendingTrust") === "1";
    const blocked = url.searchParams.get("blocked") === "1";

    const worldIdRaw = url.searchParams.get("worldId");
    const worldId = worldIdRaw ? worldIdRaw : undefined;

    const q = url.searchParams.get("q") || undefined;
    const page = Number(url.searchParams.get("page") || "1") || 1;
    const perPage = Math.min(Number(url.searchParams.get("perPage") || "50") || 50, 200);

    const trustRingRaw = url.searchParams.get("trustRing") || "";
    const trustRing: WywoTrustRing | undefined =
      trustRingRaw && trustRingRaw in WYWO_TRUST_RING_LABELS
        ? (trustRingRaw as WywoTrustRing)
        : undefined;

    const sourceTypeRaw = url.searchParams.get("sourceType") || "";
    const sourceType: WywoSourceType | undefined =
      sourceTypeRaw && sourceTypeRaw in WYWO_SOURCE_TYPE_LABELS
        ? (sourceTypeRaw as WywoSourceType)
        : undefined;

    const subscriptionIdRaw = url.searchParams.get("subscriptionId") || "";
    const subscriptionId = subscriptionIdRaw ? subscriptionIdRaw : undefined;

    const company = url.searchParams.get("company") || undefined;

    const trustStatusRaw = url.searchParams.get("trustStatus") || "";
    const trustStatus: WywoTrustStatus | undefined =
      trustStatusRaw && trustStatusRaw in WYWO_TRUST_STATUS_LABELS
        ? (trustStatusRaw as WywoTrustStatus)
        : undefined;

    const out = await listWywoMessages(actor, {
      direction,
      pendingTrust,
      blocked,
      worldId: worldId ?? null,
      query: q,
      page,
      perPage,
      trustRing,
      sourceType,
      subscriptionId: subscriptionId ?? null,
      company,
      trustStatus,
    });

    return NextResponse.json({
      ok: true,
      total: out.total,
      items: out.items.map((v) => umoFromWywoMessageView(v)),
    });
  });
}


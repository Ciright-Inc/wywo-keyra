import { NextResponse } from "next/server";
import { withWywoActor } from "@/lib/wywo/apiHelpers";
import {
  createWywoMessage,
  listWywoMessages,
} from "@/lib/wywo/messages";
import { ensurePersonalWywoWorld } from "@/lib/wywo/worlds";
import {
  WYWO_SOURCE_TYPE_LABELS,
  WYWO_TRUST_RING_LABELS,
  WYWO_TRUST_STATUS_LABELS,
} from "@/lib/wywo/constants";
import type { WywoSourceType, WywoTrustRing, WywoTrustStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

type Direction = "inbox" | "sent" | "all";

export async function GET(req: Request) {
  return withWywoActor(req, async (actor) => {
    const url = new URL(req.url);
    const direction = (url.searchParams.get("direction") || "inbox") as Direction;
    const pendingTrust = url.searchParams.get("pendingTrust") === "1";
    const blocked = url.searchParams.get("blocked") === "1";
    const worldId = url.searchParams.get("worldId") || undefined;
    const query = url.searchParams.get("q") || undefined;
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

    const page = Number(url.searchParams.get("page") || "1") || 1;
    const perPage = Math.min(Number(url.searchParams.get("perPage") || "50") || 50, 200);
    const out = await listWywoMessages(actor, {
      direction,
      pendingTrust,
      blocked,
      worldId,
      query,
      page,
      perPage,
      trustRing,
      sourceType,
      subscriptionId: subscriptionId ?? null,
      company,
      trustStatus,
    });
    return out;
  });
}

export async function POST(req: Request) {
  return withWywoActor(req, async (actor) => {
    const body = (await req.json()) as Record<string, unknown>;
    await ensurePersonalWywoWorld({
      phoneE164: actor.phoneE164,
      displayName: actor.displayName,
      email: actor.email,
      uid: actor.uid,
    });
    const expiresAtRaw = body.expiresAt as string | null | undefined;
    const result = await createWywoMessage(actor, {
      recipientPhone: String(body.recipientPhone ?? ""),
      recipientName: (body.recipientName as string | null) ?? null,
      recipientEmail: (body.recipientEmail as string | null) ?? null,
      ccRecipients: Array.isArray(body.ccRecipients)
        ? (body.ccRecipients as Array<{ phone: string; name?: string; email?: string }>)
        : [],
      attachments: Array.isArray(body.attachments) ? (body.attachments as Array<{ name: string }>) : [],
      subject: String(body.subject ?? ""),
      body: String(body.body ?? ""),
      priority: typeof body.priority === "string" ? body.priority : undefined,
      category: typeof body.category === "string" ? body.category : undefined,
      urgent: !!body.urgent,
      readReceiptRequested: !!body.readReceiptRequested,
      expiresAt: expiresAtRaw ? new Date(expiresAtRaw) : null,
      worldId: typeof body.worldId === "string" ? body.worldId : null,
      toWorldId: typeof body.toWorldId === "string" ? body.toWorldId : null,
      referralPhoneNumber: typeof body.referralPhoneNumber === "string"
        ? body.referralPhoneNumber
        : null,
      forceInvite: !!body.forceInvite,
    });
    return NextResponse.json({ ok: true, ...result });
  });
}

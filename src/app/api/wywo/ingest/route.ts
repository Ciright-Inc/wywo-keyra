import { NextResponse } from "next/server";
import { withWywoActor, jsonError } from "@/lib/wywo/apiHelpers";
import { createWywoMessage } from "@/lib/wywo/messages";
import type { WywoSourceType } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return withWywoActor(req, async (actor) => {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    const senderPhone = typeof body.senderPhone === "string" ? body.senderPhone : null;
    if (!senderPhone) return jsonError("senderPhone is required.", 400);

    const recipientPhone = typeof body.recipientPhone === "string" ? body.recipientPhone : "";
    const messageSubject =
      typeof body.messageSubject === "string" ? body.messageSubject : undefined;
    const messageBody = typeof body.messageBody === "string" ? body.messageBody : undefined;

    if (!recipientPhone) return jsonError("recipientPhone is required.", 400);
    if (!messageSubject?.trim()) return jsonError("messageSubject is required.", 400);
    if (!messageBody?.trim()) return jsonError("messageBody is required.", 400);

    const sourceTypeRaw =
      typeof body.sourceType === "string" ? (body.sourceType as WywoSourceType) : undefined;

    // Ingestion is permitted only for authenticated internal actors, but the message
    // sender itself is taken from the provider payload (no anonymous communication).
    const senderActor = {
      phoneE164: senderPhone,
      displayName: typeof body.senderName === "string" && body.senderName.trim()
        ? body.senderName
        : senderPhone,
      email: typeof body.senderEmail === "string" && body.senderEmail.trim() ? body.senderEmail : undefined,
      uid: typeof body.senderUid === "string" && body.senderUid.trim() ? body.senderUid : undefined,
      subscriptionId:
        typeof body.subscriptionId === "string" && body.subscriptionId.trim()
          ? body.subscriptionId
          : undefined,
      eid: typeof body.eid === "string" && body.eid.trim() ? body.eid : undefined,
      keyraIdentityId:
        typeof body.keyraIdentityId === "string" && body.keyraIdentityId.trim()
          ? body.keyraIdentityId
          : undefined,
    };

    const result = await createWywoMessage(senderActor, {
      recipientPhone,
      subject: messageSubject,
      body: messageBody,
      sourceType: sourceTypeRaw,
      sourceProvider: typeof body.sourceProvider === "string" ? body.sourceProvider : null,
      sourceMessageId: typeof body.sourceMessageId === "string" ? body.sourceMessageId : null,
      sourceThreadId: typeof body.sourceThreadId === "string" ? body.sourceThreadId : null,
      threadId: typeof body.threadId === "string" ? body.threadId : null,
      conversationId:
        typeof body.conversationId === "string" ? body.conversationId : null,
      transcription: typeof body.transcription === "string" ? body.transcription : null,
      aiSummary: typeof body.aiSummary === "string" ? body.aiSummary : null,
      sentiment: typeof body.sentiment === "string" ? body.sentiment : null,
      urgencyScore: typeof body.urgencyScore === "number" ? body.urgencyScore : null,
      deviceTargets: Array.isArray(body.deviceTargets) ? (body.deviceTargets as string[]) : [],
      routingPolicy:
        body.routingPolicy && typeof body.routingPolicy === "object"
          ? (body.routingPolicy as Record<string, unknown>)
          : undefined,
      calendarReference:
        body.calendarReference && typeof body.calendarReference === "object"
          ? (body.calendarReference as Record<string, unknown>)
          : null,
      crmReference:
        body.crmReference && typeof body.crmReference === "object"
          ? (body.crmReference as Record<string, unknown>)
          : null,
      taskReference:
        body.taskReference && typeof body.taskReference === "object"
          ? (body.taskReference as Record<string, unknown>)
          : null,
      recipientName: typeof body.recipientName === "string" ? body.recipientName : null,
      recipientEmail: typeof body.recipientEmail === "string" ? body.recipientEmail : null,
      priority: typeof body.priority === "string" ? body.priority : undefined,
      category: typeof body.category === "string" ? body.category : undefined,
      urgent: !!body.urgent,
      readReceiptRequested: !!body.readReceiptRequested,
      expiresAt:
        typeof body.expiresAt === "string" || body.expiresAt instanceof Date
          ? new Date(body.expiresAt as string)
          : null,
      worldId: typeof body.worldId === "string" ? body.worldId : null,
      toWorldId: typeof body.toWorldId === "string" ? body.toWorldId : null,
      referralPhoneNumber:
        typeof body.referralPhoneNumber === "string" ? body.referralPhoneNumber : null,
      forceInvite: !!body.forceInvite,
    });

    return NextResponse.json({ ok: true, ...result });
  });
}


import "server-only";

import type { KeyraWywoMessage, WywoSourceType, WywoTrustStatus } from "@prisma/client";
import { decryptMessageBody } from "./crypto";
import type { WywoMessageView } from "./types";

/**
 * Unified Message Object (UMO) — canonical communications schema for WYWO.
 * All inbound channels (SMS, WhatsApp, voicemail, native WYWO, etc.) normalize here.
 */
export type { WywoSourceType };

export type UnifiedMessageObject = {
  normalizedMessageId: string;
  sourceType: WywoSourceType;
  sourceProvider: string | null;
  sourceMessageId: string | null;
  sourceThreadId: string | null;
  subscriptionId: string | null;
  eid: string | null;
  uid: string | null;
  worldId: string | null;
  keyraIdentityId: string | null;
  senderIdentity: string | null;
  senderPhone: string;
  senderEmail: string | null;
  recipientIdentity: string | null;
  recipientPhone: string;
  recipientEmail: string | null;
  trustState: WywoTrustStatus;
  messageSubject: string;
  messageBody: string;
  attachments: Array<{ name: string; mime?: string; sizeBytes?: number; url?: string }>;
  transcription: string | null;
  aiSummary: string | null;
  sentiment: string | null;
  urgencyScore: number | null;
  threadId: string | null;
  conversationId: string | null;
  deviceTargets: string[];
  routingPolicy: Record<string, unknown>;
  calendarReference: Record<string, unknown> | null;
  crmReference: Record<string, unknown> | null;
  taskReference: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
  deliveredAt: Date | null;
  readAt: Date | null;
};

function parseAttachments(value: unknown): UnifiedMessageObject["attachments"] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is Record<string, unknown> => !!v && typeof v === "object")
    .map((row) => ({
      name: String(row.name ?? "attachment"),
      mime: row.mime ? String(row.mime) : undefined,
      sizeBytes: typeof row.sizeBytes === "number" ? row.sizeBytes : undefined,
      url: row.url ? String(row.url) : undefined,
    }));
}

function parseJsonRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v)).filter(Boolean);
}

/** Map a persisted WYWO row into the UMO contract. */
export function umoFromWywoMessage(m: KeyraWywoMessage): UnifiedMessageObject {
  const row = m as KeyraWywoMessage & {
    sourceType?: string | null;
    sourceProvider?: string | null;
    sourceMessageId?: string | null;
    sourceThreadId?: string | null;
    senderEmail?: string | null;
    senderIdentity?: string | null;
    recipientIdentity?: string | null;
    threadId?: string | null;
    conversationId?: string | null;
    transcription?: string | null;
    aiSummary?: string | null;
    sentiment?: string | null;
    urgencyScore?: number | null;
    deviceTargetsJson?: unknown;
    routingPolicyJson?: unknown;
    calendarReferenceJson?: unknown;
    crmReferenceJson?: unknown;
    taskReferenceJson?: unknown;
  };

  const sourceType: WywoSourceType = row.sourceType ?? "WYWO_NATIVE";

  return {
    normalizedMessageId: m.wywoMessageId,
    sourceType,
    sourceProvider: row.sourceProvider ?? null,
    sourceMessageId: row.sourceMessageId ?? null,
    sourceThreadId: row.sourceThreadId ?? null,
    subscriptionId: m.subscriptionId,
    eid: m.eid,
    uid: m.uid,
    worldId: m.worldId,
    keyraIdentityId: m.keyraIdentityId,
    senderIdentity: row.senderIdentity ?? m.senderKeyraId ?? m.senderUid ?? null,
    senderPhone: m.senderPhone,
    senderEmail: row.senderEmail ?? null,
    recipientIdentity: row.recipientIdentity ?? m.recipientKeyraId ?? m.recipientUid ?? null,
    recipientPhone: m.recipientPhone,
    recipientEmail: m.recipientEmail,
    trustState: m.trustStatus,
    messageSubject: m.subject,
    messageBody: decryptMessageBody(m.bodyEncrypted, m.bodyCryptoJson),
    attachments: parseAttachments(m.attachmentsJson),
    transcription: row.transcription ?? null,
    aiSummary: row.aiSummary ?? null,
    sentiment: row.sentiment ?? null,
    urgencyScore: row.urgencyScore ?? null,
    threadId: row.threadId ?? null,
    conversationId: row.conversationId ?? null,
    deviceTargets: parseStringArray(row.deviceTargetsJson),
    routingPolicy: parseJsonRecord(row.routingPolicyJson) ?? {},
    calendarReference: parseJsonRecord(row.calendarReferenceJson),
    crmReference: parseJsonRecord(row.crmReferenceJson),
    taskReference: parseJsonRecord(row.taskReferenceJson),
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
    deliveredAt: m.deliveredAt,
    readAt: m.readAt,
  };
}

/** Best-effort UMO mapping from the web-layer `WywoMessageView`. */
export function umoFromWywoMessageView(v: WywoMessageView): UnifiedMessageObject {
  return {
    normalizedMessageId: v.wywoMessageId,
    sourceType: v.sourceType,
    sourceProvider: v.sourceProvider,
    sourceMessageId: v.sourceMessageId,
    sourceThreadId: v.sourceThreadId,
    subscriptionId: v.subscriptionId,
    eid: null,
    uid: null,
    worldId: v.worldId,
    keyraIdentityId: null,
    senderIdentity: v.senderUid,
    senderPhone: v.senderPhone,
    senderEmail: v.senderEmail,
    recipientIdentity: v.recipientUid,
    recipientPhone: v.recipientPhone,
    recipientEmail: v.recipientEmail,
    trustState: v.trustStatus,
    messageSubject: v.subject,
    messageBody: v.body,
    attachments: v.attachments,
    transcription: v.transcription,
    aiSummary: v.aiSummary,
    sentiment: v.sentiment,
    urgencyScore: v.urgencyScore,
    threadId: v.threadId,
    conversationId: v.conversationId,
    deviceTargets: [],
    routingPolicy: {},
    calendarReference: null,
    crmReference: null,
    taskReference: null,
    createdAt: v.createdAt,
    updatedAt: v.updatedAt,
    deliveredAt: v.deliveredAt,
    readAt: v.readAt,
  };
}

/** Ingest payload from external providers before persistence. */
export type WywoIngestPayload = Partial<UnifiedMessageObject> & {
  sourceType: WywoSourceType;
  senderPhone: string;
  recipientPhone: string;
  messageSubject: string;
  messageBody: string;
};

export function defaultUmoFromIngest(payload: WywoIngestPayload): Pick<
  UnifiedMessageObject,
  "sourceType" | "sourceProvider" | "sourceMessageId" | "sourceThreadId"
> {
  return {
    sourceType: payload.sourceType,
    sourceProvider: payload.sourceProvider ?? payload.sourceType.toLowerCase(),
    sourceMessageId: payload.sourceMessageId ?? null,
    sourceThreadId: payload.sourceThreadId ?? null,
  };
}

import "server-only";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type { KeyraWywoMessage, WywoTrustStatus } from "@prisma/client";

import {
  BLOCKED_TRUST_STATUSES,
  PENDING_TRUST_STATUSES,
  TRUSTED_INBOX_STATUSES,
} from "./constants";
import { decryptMessageBody, encryptMessageBody } from "./crypto";
import { recordWywoAudit } from "./audit";
import { evaluateTrust, ringForStatus, upsertContactTrust } from "./trust";
import { createWywoInvite } from "./invites";
import { toE164 } from "./phone";
import type { WywoActor, WywoListResult, WywoMessageView } from "./types";
import { deriveWorldIdForPhone, ensurePersonalWywoWorld } from "./worlds";

type ListOpts = {
  direction?: "inbox" | "sent" | "all";
  pendingTrust?: boolean;
  blocked?: boolean;
  worldId?: string | null;
  query?: string;
  trustStatus?: WywoTrustStatus;
  page?: number;
  perPage?: number;
};

function ccRecipientsToJson(value: unknown): WywoMessageView["ccRecipients"] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is Record<string, unknown> => !!v && typeof v === "object")
    .map((row) => ({
      phone: String(row.phone ?? ""),
      name: row.name ? String(row.name) : undefined,
      email: row.email ? String(row.email) : undefined,
    }))
    .filter((row) => !!row.phone);
}

function attachmentsToJson(value: unknown): WywoMessageView["attachments"] {
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

function toView(actor: WywoActor, m: KeyraWywoMessage): WywoMessageView {
  const direction: WywoMessageView["direction"] =
    m.senderPhone === actor.phoneE164 ? "sent" : "inbox";
  return {
    id: m.id,
    wywoMessageId: m.wywoMessageId,
    worldId: m.worldId,
    fromWorldId: m.fromWorldId,
    toWorldId: m.toWorldId,
    subscriptionId: m.subscriptionId,
    subject: m.subject,
    body: decryptMessageBody(m.bodyEncrypted, m.bodyCryptoJson),
    senderName: m.senderName ?? "Unknown sender",
    senderPhone: m.senderPhone,
    senderEmail: null,
    senderUid: m.senderUid,
    recipientName: m.recipientName,
    recipientPhone: m.recipientPhone,
    recipientEmail: m.recipientEmail,
    recipientUid: m.recipientUid,
    ccRecipients: ccRecipientsToJson(m.ccRecipientsJson),
    attachments: attachmentsToJson(m.attachmentsJson),
    priority: m.priority,
    category: m.category ?? "general",
    urgent: m.urgent,
    readReceiptRequested: m.readReceiptRequested,
    trustStatus: m.trustStatus,
    messageStatus: m.messageStatus,
    referralRequired: m.referralRequired,
    referralPhoneNumber: m.referralPhoneNumber,
    inviteToken: m.inviteToken,
    inviteStatus: m.inviteStatus,
    direction,
    expiresAt: m.expiresAt,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
    deliveredAt: m.deliveredAt,
    readAt: m.readAt,
    approvedAt: m.approvedAt,
    blockedAt: m.blockedAt,
    archivedAt: m.archivedAt,
    parentMessageId: null,
  };
}

export async function listWywoMessages(
  actor: WywoActor,
  opts: ListOpts = {},
): Promise<WywoListResult> {
  const direction = opts.direction ?? "inbox";
  const andClauses: Prisma.KeyraWywoMessageWhereInput[] = [];

  if (direction === "inbox") andClauses.push({ recipientPhone: actor.phoneE164 });
  else if (direction === "sent") andClauses.push({ senderPhone: actor.phoneE164 });
  else
    andClauses.push({
      OR: [
        { recipientPhone: actor.phoneE164 },
        { senderPhone: actor.phoneE164 },
      ],
    });

  if (opts.pendingTrust) {
    andClauses.push({ trustStatus: { in: PENDING_TRUST_STATUSES } });
  } else if (opts.blocked) {
    andClauses.push({ trustStatus: { in: BLOCKED_TRUST_STATUSES } });
  } else if (opts.trustStatus) {
    andClauses.push({ trustStatus: opts.trustStatus });
  } else if (direction === "inbox") {
    andClauses.push({ trustStatus: { in: TRUSTED_INBOX_STATUSES } });
  }

  if (opts.worldId) andClauses.push({ worldId: opts.worldId });

  if (opts.query) {
    andClauses.push({
      OR: [
        { subject: { contains: opts.query, mode: "insensitive" } },
        { senderName: { contains: opts.query, mode: "insensitive" } },
        { senderPhone: { contains: opts.query } },
        { recipientPhone: { contains: opts.query } },
      ],
    });
  }

  const where: Prisma.KeyraWywoMessageWhereInput = { AND: andClauses };

  const perPage = Math.min(Math.max(opts.perPage ?? 25, 1), 200);
  const page = Math.max(opts.page ?? 1, 1);

  const [total, rows] = await Promise.all([
    prisma.keyraWywoMessage.count({ where }),
    prisma.keyraWywoMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
  ]);

  return {
    total,
    items: rows.map((m) => toView(actor, m)),
  };
}

export async function getWywoMessage(
  actor: WywoActor,
  id: string,
): Promise<WywoMessageView | null> {
  const m = await prisma.keyraWywoMessage.findFirst({
    where: {
      AND: [
        { OR: [{ id }, { wywoMessageId: id }] },
        {
          OR: [
            { recipientPhone: actor.phoneE164 },
            { senderPhone: actor.phoneE164 },
          ],
        },
      ],
    },
  });
  if (!m) return null;
  // Mark as read when the recipient opens it for the first time.
  if (m.recipientPhone === actor.phoneE164 && !m.readAt) {
    await prisma.keyraWywoMessage.update({
      where: { id: m.id },
      data: { readAt: new Date(), messageStatus: "READ" },
    });
    await recordWywoAudit({
      messageId: m.id,
      actorPhone: actor.phoneE164,
      actorUid: actor.uid ?? null,
      action: "message.read",
    });
    m.readAt = new Date();
    m.messageStatus = "READ";
  }
  return toView(actor, m);
}

export type CreateWywoMessageInput = {
  subject: string;
  body: string;
  recipientPhone: string;
  recipientName?: string | null;
  recipientEmail?: string | null;
  ccRecipients?: Array<{ phone: string; name?: string; email?: string }>;
  attachments?: WywoMessageView["attachments"];
  priority?: string;
  category?: string;
  urgent?: boolean;
  readReceiptRequested?: boolean;
  expiresAt?: Date | null;
  worldId?: string | null;
  toWorldId?: string | null;
  parentMessageId?: string | null;
  referralPhoneNumber?: string | null;
  /** When true, recipient must verify identity through an SMS invite first. */
  forceInvite?: boolean;
};

export type CreateWywoMessageResult = {
  message: WywoMessageView;
  trustStatus: WywoTrustStatus;
  inviteIssued: boolean;
  inviteUrl?: string;
  inviteSmsBody?: string;
  inviteSmsOk?: boolean;
  /** Which dispatcher ran for the invite SMS. */
  inviteSmsProvider?: "stdout" | "webhook" | "twilio";
  /** True when no SMS provider is configured (stdout log only). */
  inviteSmsDevOnly?: boolean;
  /** Recipient already had a Keyra world (no invite required). */
  recipientOnKeyra: boolean;
};

export async function createWywoMessage(
  actor: WywoActor,
  input: CreateWywoMessageInput,
): Promise<CreateWywoMessageResult> {
  const recipientPhone = toE164(input.recipientPhone);
  if (!recipientPhone) {
    throw new Error("Invalid recipient phone number.");
  }
  if (!input.subject?.trim()) throw new Error("Subject is required.");
  if (!input.body?.trim()) throw new Error("Message body is required.");
  if (recipientPhone === actor.phoneE164) {
    throw new Error("You cannot send a WYWO message to yourself.");
  }

  const senderWorld = await ensurePersonalWywoWorld({
    phoneE164: actor.phoneE164,
    displayName: actor.displayName,
    email: actor.email,
    uid: actor.uid,
    subscriptionId: actor.subscriptionId,
    eid: actor.eid,
    keyraIdentityId: actor.keyraIdentityId,
  });

  const trust = await evaluateTrust(actor.phoneE164, recipientPhone);
  if (trust.isBlocked) {
    throw new Error("This recipient is blocked. Update trust before sending.");
  }

  const recipientHasKeyraWorld = !!(await prisma.keyraWywoWorld.findFirst({
    where: { ownerPhoneE164: recipientPhone },
    select: { id: true },
  }));
  const recipientTrustWithUs = await evaluateTrust(recipientPhone, actor.phoneE164);

  const requiresInvite = input.forceInvite || !recipientHasKeyraWorld;

  // Compute trust status from the recipient's perspective on the sender.
  let trustStatus: WywoTrustStatus;
  if (recipientTrustWithUs.isBlocked) {
    throw new Error("The recipient has blocked your number.");
  } else if (recipientTrustWithUs.isTrusted) {
    trustStatus = recipientTrustWithUs.trustStatus;
  } else if (!recipientHasKeyraWorld) {
    trustStatus = "PENDING_REVIEW";
  } else if (input.referralPhoneNumber) {
    trustStatus = "REFERRED";
  } else {
    trustStatus = "PENDING_REVIEW";
  }

  const referralRequired = trustStatus === "PENDING_REVIEW" || trustStatus === "REFERRED";
  const referralPhone = input.referralPhoneNumber
    ? toE164(input.referralPhoneNumber) ?? input.referralPhoneNumber
    : null;

  const { ciphertext, meta } = encryptMessageBody(input.body);
  const messageStatus = requiresInvite ? "QUEUED" : "DELIVERED";
  const cc = (input.ccRecipients ?? [])
    .map((r) => ({ ...r, phone: toE164(r.phone) ?? r.phone }))
    .filter((r) => !!r.phone);

  const created = await prisma.keyraWywoMessage.create({
    data: {
      subscriptionId: actor.subscriptionId ?? null,
      eid: actor.eid ?? null,
      uid: actor.uid ?? null,
      worldId: input.worldId ?? senderWorld.worldId,
      fromWorldId: senderWorld.worldId,
      toWorldId: input.toWorldId ?? (recipientHasKeyraWorld ? deriveWorldIdForPhone(recipientPhone) : null),
      senderUid: actor.uid ?? null,
      senderKeyraId: actor.keyraIdentityId ?? null,
      senderName: actor.displayName,
      senderPhone: actor.phoneE164,
      recipientUid: recipientTrustWithUs.contact?.contactUid ?? null,
      recipientKeyraId: null,
      recipientName: input.recipientName ?? null,
      recipientPhone,
      recipientEmail: input.recipientEmail ?? null,
      ccRecipientsJson: (cc.length ? cc : []) as unknown as Prisma.InputJsonValue,
      subject: input.subject.trim(),
      bodyEncrypted: ciphertext,
      bodyCryptoJson: meta as unknown as Prisma.InputJsonValue,
      attachmentsJson: (input.attachments?.length ? input.attachments : []) as unknown as Prisma.InputJsonValue,
      priority: input.priority ?? "normal",
      category: input.category ?? "general",
      urgent: !!input.urgent,
      readReceiptRequested: !!input.readReceiptRequested,
      expiresAt: input.expiresAt ?? null,
      trustStatus,
      messageStatus,
      referralRequired,
      referralPhoneNumber: referralPhone,
      deliveredAt: requiresInvite ? null : new Date(),
    },
  });

  // Record the recipient in the sender's CRM contact graph.
  await upsertContactTrust({
    ownerPhoneE164: actor.phoneE164,
    ownerUid: actor.uid ?? actor.phoneE164,
    contactPhone: recipientPhone,
    contactName: input.recipientName ?? trust.contact?.contactName ?? null,
    trustStatus: trust.contact?.trustStatus ?? "PENDING_REVIEW",
    trustRing: trust.contact?.trustRing ?? "PENDING_UNKNOWNS",
  });
  // Record the sender in the recipient's pending list (so the recipient sees a pending row).
  await upsertContactTrust({
    ownerPhoneE164: recipientPhone,
    contactPhone: actor.phoneE164,
    contactName: actor.displayName,
    ownerUid: actor.uid ?? recipientPhone,
    trustStatus: recipientTrustWithUs.contact?.trustStatus ?? trustStatus,
    trustRing: recipientTrustWithUs.contact?.trustRing ?? ringForStatus(trustStatus),
    referralPhone: referralPhone,
  });

  await recordWywoAudit({
    messageId: created.id,
    actorPhone: actor.phoneE164,
    actorUid: actor.uid ?? null,
    action: "message.created",
    newValue: { trustStatus, requiresInvite, referralRequired },
  });

  let inviteUrl: string | undefined;
  let inviteSmsBody: string | undefined;
  let inviteSmsOk: boolean | undefined;
  let inviteSmsProvider: "stdout" | "webhook" | "twilio" | undefined;
  let inviteSmsDevOnly: boolean | undefined;
  let inviteIssued = false;
  if (requiresInvite) {
    const result = await createWywoInvite({
      messageId: created.id,
      senderUid: actor.uid ?? null,
      senderPhoneE164: actor.phoneE164,
      senderName: actor.displayName,
      recipientPhone,
      recipientName: input.recipientName ?? null,
      worldId: senderWorld.worldId,
      subscriptionId: actor.subscriptionId ?? null,
    });
    inviteUrl = result.inviteUrl;
    inviteSmsBody = result.smsBody;
    inviteSmsOk = result.smsOk;
    inviteSmsProvider = result.smsProvider;
    inviteSmsDevOnly = result.smsDevOnly;
    inviteIssued = true;
    await recordWywoAudit({
      messageId: created.id,
      actorPhone: actor.phoneE164,
      action: "invite.issued",
      newValue: { inviteUrl, smsOk: result.smsOk, smsProvider: result.smsProvider },
    });
  } else {
    await recordWywoAudit({
      messageId: created.id,
      actorPhone: actor.phoneE164,
      action: "message.delivered",
    });
  }

  const fresh = await prisma.keyraWywoMessage.findUnique({ where: { id: created.id } });
  return {
    message: toView(actor, fresh ?? created),
    trustStatus,
    inviteIssued,
    inviteUrl,
    inviteSmsBody,
    inviteSmsOk,
    inviteSmsProvider,
    inviteSmsDevOnly,
    recipientOnKeyra: recipientHasKeyraWorld,
  };
}

export async function replyToWywoMessage(
  actor: WywoActor,
  messageId: string,
  body: string,
): Promise<CreateWywoMessageResult> {
  const original = await prisma.keyraWywoMessage.findFirst({
    where: {
      AND: [
        { OR: [{ id: messageId }, { wywoMessageId: messageId }] },
        {
          OR: [
            { recipientPhone: actor.phoneE164 },
            { senderPhone: actor.phoneE164 },
          ],
        },
      ],
    },
  });
  if (!original) throw new Error("Original message not found.");
  const isRecipient = original.recipientPhone === actor.phoneE164;
  const targetPhone = isRecipient ? original.senderPhone : original.recipientPhone;
  const targetName = isRecipient ? original.senderName ?? "" : original.recipientName ?? "";
  await prisma.keyraWywoMessage.update({
    where: { id: original.id },
    data: { messageStatus: "REPLIED" },
  });
  return createWywoMessage(actor, {
    subject: original.subject.startsWith("Re:") ? original.subject : `Re: ${original.subject}`,
    body,
    recipientPhone: targetPhone,
    recipientName: targetName,
    worldId: original.worldId,
    toWorldId: original.fromWorldId,
    priority: original.priority,
    category: original.category ?? undefined,
  });
}

async function transitionTrust(
  actor: WywoActor,
  messageId: string,
  next: WywoTrustStatus,
  action: string,
) {
  const m = await prisma.keyraWywoMessage.findFirst({
    where: {
      AND: [
        { OR: [{ id: messageId }, { wywoMessageId: messageId }] },
        { recipientPhone: actor.phoneE164 },
      ],
    },
  });
  if (!m) throw new Error("Message not found.");
  const updated = await prisma.keyraWywoMessage.update({
    where: { id: m.id },
    data: {
      trustStatus: next,
      ...(next === "BLOCKED" ? { blockedAt: new Date(), messageStatus: "BLOCKED" } : {}),
      ...(TRUSTED_INBOX_STATUSES.includes(next) ? { approvedAt: new Date() } : {}),
    },
  });
  await upsertContactTrust({
    ownerPhoneE164: actor.phoneE164,
    ownerUid: actor.uid ?? null,
    contactPhone: m.senderPhone,
    contactName: m.senderName,
    trustStatus: next,
    trustRing: ringForStatus(next),
  });
  await recordWywoAudit({
    messageId: m.id,
    actorPhone: actor.phoneE164,
    actorUid: actor.uid ?? null,
    action,
    oldValue: { trustStatus: m.trustStatus },
    newValue: { trustStatus: next },
  });
  return toView(actor, updated);
}

export function approveSender(
  actor: WywoActor,
  messageId: string,
  ring: WywoTrustStatus = "TRUSTED",
) {
  return transitionTrust(actor, messageId, ring, "sender.approved");
}

export function blockSender(actor: WywoActor, messageId: string) {
  return transitionTrust(actor, messageId, "BLOCKED", "sender.blocked");
}

export async function archiveMessage(actor: WywoActor, messageId: string) {
  const m = await prisma.keyraWywoMessage.findFirst({
    where: {
      AND: [
        { OR: [{ id: messageId }, { wywoMessageId: messageId }] },
        {
          OR: [
            { recipientPhone: actor.phoneE164 },
            { senderPhone: actor.phoneE164 },
          ],
        },
      ],
    },
  });
  if (!m) throw new Error("Message not found.");
  const updated = await prisma.keyraWywoMessage.update({
    where: { id: m.id },
    data: { archivedAt: new Date(), messageStatus: "ARCHIVED" },
  });
  await recordWywoAudit({
    messageId: m.id,
    actorPhone: actor.phoneE164,
    action: "message.archived",
  });
  return toView(actor, updated);
}

export async function listAdminMessages(opts: {
  worldId?: string;
  subscriptionId?: string;
  trustStatus?: WywoTrustStatus;
  phone?: string;
  query?: string;
  page?: number;
  perPage?: number;
}) {
  const andClauses: Prisma.KeyraWywoMessageWhereInput[] = [];
  if (opts.worldId) andClauses.push({ worldId: opts.worldId });
  if (opts.subscriptionId) andClauses.push({ subscriptionId: opts.subscriptionId });
  if (opts.trustStatus) andClauses.push({ trustStatus: opts.trustStatus });
  if (opts.phone) {
    andClauses.push({
      OR: [
        { senderPhone: { contains: opts.phone } },
        { recipientPhone: { contains: opts.phone } },
      ],
    });
  }
  if (opts.query) {
    andClauses.push({
      OR: [
        { subject: { contains: opts.query, mode: "insensitive" } },
        { senderName: { contains: opts.query, mode: "insensitive" } },
      ],
    });
  }
  const where: Prisma.KeyraWywoMessageWhereInput = andClauses.length
    ? { AND: andClauses }
    : {};
  const perPage = Math.min(Math.max(opts.perPage ?? 50, 1), 200);
  const page = Math.max(opts.page ?? 1, 1);
  const [total, items] = await Promise.all([
    prisma.keyraWywoMessage.count({ where }),
    prisma.keyraWywoMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
  ]);
  return { total, items };
}

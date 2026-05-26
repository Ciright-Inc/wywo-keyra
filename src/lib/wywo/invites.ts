import "server-only";

import { prisma } from "@/lib/prisma";
import type { KeyraWywoInvite } from "@prisma/client";
import { generateInviteToken } from "./crypto";
import { buildInviteSms, WYWO_INVITE_TTL_MS } from "./constants";
import { sendSms } from "./sms";
import { toE164 } from "./phone";

function inviteBaseUrl(): string {
  const explicit =
    process.env.WYWO_PUBLIC_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_WYWO_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_KEYRA_BASE_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  return "https://wywo.keyra.ie";
}

export type CreateInviteInput = {
  messageId: string;
  senderUid?: string | null;
  senderPhoneE164: string;
  senderName: string;
  recipientPhone: string;
  recipientName?: string | null;
  worldId?: string | null;
  subscriptionId?: string | null;
};

export type CreateInviteResult = {
  invite: KeyraWywoInvite;
  inviteUrl: string;
  smsBody: string;
  smsOk: boolean;
  smsProvider: "stdout" | "webhook" | "twilio";
  smsDevOnly: boolean;
};

export async function createWywoInvite(
  input: CreateInviteInput,
): Promise<CreateInviteResult> {
  const senderE = toE164(input.senderPhoneE164) ?? input.senderPhoneE164;
  const recipientE = toE164(input.recipientPhone) ?? input.recipientPhone;
  const token = generateInviteToken();

  const expiresAt = new Date(Date.now() + WYWO_INVITE_TTL_MS);

  const invite = await prisma.keyraWywoInvite.create({
    data: {
      inviteToken: token,
      messageId: input.messageId,
      senderUid: input.senderUid ?? null,
      senderPhoneE164: senderE,
      recipientPhone: recipientE,
      recipientName: input.recipientName ?? null,
      worldId: input.worldId ?? null,
      subscriptionId: input.subscriptionId ?? null,
      status: "PENDING",
      expiresAt,
    },
  });

  const inviteUrl = `${inviteBaseUrl()}/wywo/invite/${token}`;
  const smsBody = buildInviteSms({ senderName: input.senderName, inviteUrl });
  const dispatch = await sendSms({
    to: recipientE,
    body: smsBody,
    context: { messageId: input.messageId, inviteToken: token, worldId: input.worldId ?? null },
  });

  await prisma.keyraWywoInvite.update({
    where: { id: invite.id },
    data: {
      status: dispatch.ok ? "SMS_SENT" : "PENDING",
      smsSentAt: dispatch.ok ? new Date() : null,
    },
  });
  await prisma.keyraWywoMessage.update({
    where: { id: input.messageId },
    data: {
      inviteToken: token,
      inviteStatus: dispatch.ok ? "SMS_SENT" : "PENDING",
    },
  });

  return {
    invite: { ...invite, status: dispatch.ok ? "SMS_SENT" : "PENDING" },
    inviteUrl,
    smsBody,
    smsOk: dispatch.ok,
    smsProvider: dispatch.provider,
    smsDevOnly: !!dispatch.devOnly,
  };
}

/** Invite expiry — DB stores `expiredAt` when past; TTL computed from `createdAt`. */
export function inviteIsExpired(invite: { createdAt: Date; expiredAt: Date | null }): boolean {
  if (invite.expiredAt) return true;
  return invite.createdAt.getTime() + WYWO_INVITE_TTL_MS < Date.now();
}

export async function findInviteByToken(token: string) {
  if (!token) return null;
  return prisma.keyraWywoInvite.findUnique({
    where: { inviteToken: token },
    include: { message: true },
  });
}

export async function markInviteClicked(token: string) {
  await prisma.keyraWywoInvite.updateMany({
    where: { inviteToken: token, status: { in: ["PENDING", "SMS_SENT"] } },
    data: { status: "CLICKED", clickedAt: new Date() },
  });
}

export async function markInviteVerified(token: string) {
  const invite = await prisma.keyraWywoInvite.findUnique({
    where: { inviteToken: token },
  });
  if (!invite) return null;
  if (invite.status === "EXPIRED" || invite.status === "REVOKED") return invite;
  if (inviteIsExpired(invite)) {
    await prisma.keyraWywoInvite.update({
      where: { id: invite.id },
      data: { status: "EXPIRED", expiredAt: new Date() },
    });
    return null;
  }
  return prisma.keyraWywoInvite.update({
    where: { id: invite.id },
    data: { status: "VERIFIED", verifiedAt: new Date() },
  });
}

export async function listInvitesForSender(senderPhoneE164: string) {
  return prisma.keyraWywoInvite.findMany({
    where: { senderPhoneE164 },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function listAllInvites(opts?: {
  status?: KeyraWywoInvite["status"];
  limit?: number;
}) {
  return prisma.keyraWywoInvite.findMany({
    where: opts?.status ? { status: opts.status } : undefined,
    orderBy: { createdAt: "desc" },
    take: Math.min(Math.max(opts?.limit ?? 100, 1), 500),
  });
}

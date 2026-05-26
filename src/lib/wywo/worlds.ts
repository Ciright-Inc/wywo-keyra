import "server-only";

import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type { KeyraWywoWorld } from "@prisma/client";
import { toE164 } from "./phone";

/**
 * Compute a stable WYWO world id for a phone-anchored Keyra identity.
 * Format: kwy_<sha256(phone):16> so that the same phone yields the same world.
 */
export function deriveWorldIdForPhone(phoneE164: string): string {
  const h = createHash("sha256").update(phoneE164).digest("hex");
  return `kwy_${h.slice(0, 24)}`;
}

export type EnsureWywoWorldInput = {
  phoneE164: string;
  displayName?: string;
  email?: string;
  uid?: string;
  subscriptionId?: string;
  eid?: string;
  keyraIdentityId?: string;
};

export async function ensurePersonalWywoWorld(
  input: EnsureWywoWorldInput,
): Promise<KeyraWywoWorld> {
  const phoneE164 = toE164(input.phoneE164) ?? input.phoneE164;
  const worldId = deriveWorldIdForPhone(phoneE164);
  const baseName = input.displayName?.trim() || `${phoneE164} world`;
  const updateData: Record<string, unknown> = {};
  if (input.uid !== undefined) updateData.ownerUid = input.uid ?? null;
  if (input.subscriptionId !== undefined) updateData.subscriptionId = input.subscriptionId ?? null;
  if (input.eid !== undefined) updateData.eid = input.eid ?? null;
  if (input.keyraIdentityId !== undefined) updateData.keyraIdentityId = input.keyraIdentityId ?? null;
  return prisma.keyraWywoWorld.upsert({
    where: { worldId },
    update: updateData,
    create: {
      worldId,
      ownerPhoneE164: phoneE164,
      ownerUid: input.uid ?? null,
      subscriptionId: input.subscriptionId ?? null,
      eid: input.eid ?? null,
      keyraIdentityId: input.keyraIdentityId ?? null,
      name: baseName,
      email: input.email ?? null,
    },
  });
}

export type UpdateWywoWorldInput = {
  phoneE164: string;
  name?: string;
  company?: string | null;
  role?: string | null;
  country?: string | null;
  preferredDevice?: string | null;
  notificationRules?: Record<string, unknown> | null;
  subscriptionId?: string | null;
  eid?: string | null;
  uid?: string | null;
};

export async function updatePersonalWywoWorld(input: UpdateWywoWorldInput): Promise<KeyraWywoWorld> {
  const phoneE164 = toE164(input.phoneE164) ?? input.phoneE164;
  const worldId = deriveWorldIdForPhone(phoneE164);
  const data: Prisma.KeyraWywoWorldUpdateInput = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.company !== undefined) data.company = input.company;
  if (input.role !== undefined) data.role = input.role;
  if (input.country !== undefined) data.country = input.country;
  if (input.preferredDevice !== undefined) data.preferredDevice = input.preferredDevice;
  if (input.notificationRules !== undefined) {
    data.notificationRulesJson = input.notificationRules
      ? (input.notificationRules as Prisma.InputJsonValue)
      : Prisma.JsonNull;
  }
  if (input.subscriptionId !== undefined) data.subscriptionId = input.subscriptionId;
  if (input.eid !== undefined) data.eid = input.eid;
  if (input.uid !== undefined) data.ownerUid = input.uid;
  return prisma.keyraWywoWorld.update({ where: { worldId }, data });
}

export async function listWywoWorldsForOwner(phoneE164: string): Promise<KeyraWywoWorld[]> {
  return prisma.keyraWywoWorld.findMany({
    where: { ownerPhoneE164: phoneE164 },
    orderBy: { createdAt: "asc" },
  });
}

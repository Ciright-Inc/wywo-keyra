import "server-only";

import { prisma } from "@/lib/prisma";
import type {
  KeyraWywoContactTrust,
  WywoTrustRing,
  WywoTrustStatus,
} from "@prisma/client";
import { toE164 } from "./phone";

export type TrustEvaluation = {
  trustStatus: WywoTrustStatus;
  trustRing: WywoTrustRing;
  contact: KeyraWywoContactTrust | null;
  /** True when the recipient is already known to the sender. */
  isKnown: boolean;
  /** True when the recipient is allowed to receive without referral. */
  isTrusted: boolean;
  /** True when sender has blocked this recipient. */
  isBlocked: boolean;
};

/**
 * Evaluate the relationship between an owner (sender or recipient) and a contact.
 * Used both ways:
 *   - sender evaluates recipient before sending
 *   - recipient evaluates sender before inbox routing
 */
export async function evaluateTrust(
  ownerPhoneE164: string,
  contactPhone: string,
): Promise<TrustEvaluation> {
  const ownerE = toE164(ownerPhoneE164) ?? ownerPhoneE164;
  const contactE = toE164(contactPhone) ?? contactPhone;
  if (!ownerE || !contactE) {
    return {
      trustStatus: "UNKNOWN",
      trustRing: "PENDING_UNKNOWNS",
      contact: null,
      isKnown: false,
      isTrusted: false,
      isBlocked: false,
    };
  }
  const contact = await prisma.keyraWywoContactTrust.findUnique({
    where: {
      ownerPhoneE164_contactPhone: { ownerPhoneE164: ownerE, contactPhone: contactE },
    },
  });
  if (!contact) {
    return {
      trustStatus: "UNKNOWN",
      trustRing: "PENDING_UNKNOWNS",
      contact: null,
      isKnown: false,
      isTrusted: false,
      isBlocked: false,
    };
  }
  const isTrusted = ["TRUSTED", "FAMILY_CIRCLE", "EXECUTIVE_RING", "REFERRED"].includes(
    contact.trustStatus,
  );
  const isBlocked = ["BLOCKED", "SUPPRESSED", "REVOKED"].includes(contact.trustStatus);
  return {
    trustStatus: contact.trustStatus,
    trustRing: contact.trustRing,
    contact,
    isKnown: true,
    isTrusted,
    isBlocked,
  };
}

export type UpsertContactTrustInput = {
  ownerPhoneE164: string;
  ownerUid?: string | null;
  contactPhone: string;
  contactUid?: string | null;
  contactName?: string | null;
  trustStatus?: WywoTrustStatus;
  trustRing?: WywoTrustRing;
  referralUid?: string | null;
  referralPhone?: string | null;
  approvedByUid?: string | null;
  notes?: string | null;
};

export async function upsertContactTrust(
  input: UpsertContactTrustInput,
): Promise<KeyraWywoContactTrust> {
  const ownerE = toE164(input.ownerPhoneE164) ?? input.ownerPhoneE164;
  const contactE = toE164(input.contactPhone) ?? input.contactPhone;
  return prisma.keyraWywoContactTrust.upsert({
    where: {
      ownerPhoneE164_contactPhone: { ownerPhoneE164: ownerE, contactPhone: contactE },
    },
    update: {
      ...(input.contactUid !== undefined ? { contactUid: input.contactUid } : {}),
      ...(input.contactName !== undefined ? { contactName: input.contactName } : {}),
      ...(input.trustStatus ? { trustStatus: input.trustStatus } : {}),
      ...(input.trustRing ? { trustRing: input.trustRing } : {}),
      ...(input.referralUid !== undefined ? { referralUid: input.referralUid } : {}),
      ...(input.referralPhone !== undefined
        ? { referralPhone: toE164(input.referralPhone) ?? input.referralPhone }
        : {}),
      ...(input.approvedByUid !== undefined ? { approvedByUid: input.approvedByUid } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
      ...(input.ownerUid !== undefined ? { ownerUid: input.ownerUid || ownerE } : {}),
    },
    create: {
      ownerPhoneE164: ownerE,
      contactPhone: contactE,
      contactUid: input.contactUid ?? null,
      contactName: input.contactName ?? null,
      trustStatus: input.trustStatus ?? "PENDING_REVIEW",
      trustRing: input.trustRing ?? "PENDING_UNKNOWNS",
      referralUid: input.referralUid ?? null,
      referralPhone: input.referralPhone ? toE164(input.referralPhone) ?? input.referralPhone : null,
      approvedByUid: input.approvedByUid ?? null,
      notes: input.notes ?? null,
      ownerUid: input.ownerUid || ownerE,
    },
  });
}

export async function listTrustContacts(
  ownerPhoneE164: string,
): Promise<KeyraWywoContactTrust[]> {
  return prisma.keyraWywoContactTrust.findMany({
    where: { ownerPhoneE164 },
    orderBy: [{ trustRing: "asc" }, { updatedAt: "desc" }],
  });
}

export function ringForStatus(status: WywoTrustStatus): WywoTrustRing {
  switch (status) {
    case "FAMILY_CIRCLE":
      return "FAMILY_CIRCLE";
    case "EXECUTIVE_RING":
      return "EXECUTIVE_RING";
    case "TRUSTED":
      return "TRUSTED_CONTACTS";
    case "REFERRED":
      return "REFERRED_CONTACTS";
    case "BLOCKED":
    case "SUPPRESSED":
    case "REVOKED":
      return "BLOCKED_ENTITIES";
    default:
      return "PENDING_UNKNOWNS";
  }
}

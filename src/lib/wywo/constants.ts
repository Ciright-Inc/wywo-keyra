/**
 * WYWO — While You Were Out
 * Shared constants for trust rings, statuses, categories, and priorities.
 * Mirrors the doctrine in the user prompt: "Trust is earned. Never assumed."
 */

import type {
  WywoInviteStatus,
  WywoMessageStatus,
  WywoTrustRing,
  WywoTrustStatus,
  WywoSourceType,
} from "@prisma/client";

export const WYWO_TRUST_STATUS_LABELS: Record<WywoTrustStatus, string> = {
  TRUSTED: "Trusted",
  FAMILY_CIRCLE: "Family Circle",
  EXECUTIVE_RING: "Executive Ring",
  REFERRED: "Referred",
  PENDING_REVIEW: "Pending review",
  UNKNOWN: "Unknown",
  BLOCKED: "Blocked",
  SUPPRESSED: "Suppressed",
  EXPIRED: "Expired",
  REVOKED: "Revoked",
};

export const WYWO_TRUST_RING_LABELS: Record<WywoTrustRing, string> = {
  FAMILY_CIRCLE: "Family Circle",
  EXECUTIVE_RING: "Executive Ring",
  TRUSTED_CONTACTS: "Trusted Contacts",
  REFERRED_CONTACTS: "Referred Contacts",
  PENDING_UNKNOWNS: "Pending Unknowns",
  BLOCKED_ENTITIES: "Blocked Entities",
};

export const WYWO_MESSAGE_STATUS_LABELS: Record<WywoMessageStatus, string> = {
  DRAFT: "Draft",
  QUEUED: "Queued",
  DELIVERED: "Delivered",
  READ: "Read",
  REPLIED: "Replied",
  PENDING_TRUST: "Pending trust",
  ARCHIVED: "Archived",
  BLOCKED: "Blocked",
  EXPIRED: "Expired",
  REVOKED: "Revoked",
};

export const WYWO_INVITE_STATUS_LABELS: Record<WywoInviteStatus, string> = {
  PENDING: "Pending",
  SMS_SENT: "SMS sent",
  CLICKED: "Clicked",
  VERIFIED: "Verified",
  EXPIRED: "Expired",
  REVOKED: "Revoked",
};

/** Trust statuses that allow a message to enter the trusted inbox. */
export const TRUSTED_INBOX_STATUSES: WywoTrustStatus[] = [
  "TRUSTED",
  "FAMILY_CIRCLE",
  "EXECUTIVE_RING",
  "REFERRED",
];

export const PENDING_TRUST_STATUSES: WywoTrustStatus[] = [
  "PENDING_REVIEW",
  "UNKNOWN",
];

export const BLOCKED_TRUST_STATUSES: WywoTrustStatus[] = [
  "BLOCKED",
  "SUPPRESSED",
  "REVOKED",
];

export const WYWO_PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
] as const;

export const WYWO_CATEGORY_OPTIONS = [
  { value: "general", label: "General" },
  { value: "executive", label: "Executive" },
  { value: "family", label: "Family" },
  { value: "opportunity", label: "Opportunity" },
  { value: "requirement", label: "Requirement" },
  { value: "introduction", label: "Introduction" },
  { value: "agent", label: "Verified agent" },
] as const;

export const WYWO_SOURCE_TYPE_LABELS: Record<WywoSourceType, string> = {
  WYWO_NATIVE: "WYWO",
  SMS: "SMS",
  WHATSAPP: "WhatsApp",
  VOICEMAIL: "Voicemail",
  IMESSAGE_IMPORT: "iMessage import",
  OUTLOOK: "Outlook",
  CALENDAR_ALERT: "Calendar",
  TEAMS: "Teams",
  CRM: "CRM",
  SUPPORT_TICKET: "Support ticket",
  ENTERPRISE_ALERT: "Enterprise alert",
  AI_AGENT: "Verified agent",
};

export const WYWO_SOURCE_TYPE_OPTIONS = [
  "WYWO_NATIVE",
  "SMS",
  "WHATSAPP",
  "VOICEMAIL",
  "IMESSAGE_IMPORT",
  "OUTLOOK",
  "CALENDAR_ALERT",
  "TEAMS",
  "CRM",
  "SUPPORT_TICKET",
  "ENTERPRISE_ALERT",
  "AI_AGENT",
] as const satisfies readonly WywoSourceType[];

/** SMS copy template used when inviting an unknown recipient. */
export function buildInviteSms(opts: {
  senderName: string;
  inviteUrl: string;
}): string {
  return `${opts.senderName} sent you a secure WYWO message on Keyra. To receive and reply, verify your identity and create your Keyra account here: ${opts.inviteUrl}`;
}

/** Default invite token TTL — 14 days. */
export const WYWO_INVITE_TTL_MS = 14 * 24 * 60 * 60 * 1000;

/** Cookie used for the WYWO actor session (alias of the Keyra session). */
export const WYWO_RETURN_TO_QUERY = "returnTo";

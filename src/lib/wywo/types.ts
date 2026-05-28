import type {
  KeyraWywoAuditLog,
  KeyraWywoContactTrust,
  KeyraWywoInvite,
  KeyraWywoMessage,
  KeyraWywoWorld,
  WywoSourceType,
  WywoTrustStatus,
} from "@prisma/client";

/** The verified actor performing a WYWO operation. */
export type WywoActor = {
  phoneE164: string;
  displayName: string;
  email?: string;
  /** Optional Ciright user id when available. */
  uid?: string;
  /** Optional Ciright subscription id. */
  subscriptionId?: string;
  /** Optional Ciright enterprise id. */
  eid?: string;
  /** Optional Keyra identity id. */
  keyraIdentityId?: string;
  /** Whether this actor has WYWO admin rights. */
  isAdmin?: boolean;
};

export type WywoMessageView = {
  id: string;
  wywoMessageId: string;
  worldId: string | null;
  fromWorldId: string | null;
  toWorldId: string | null;
  subscriptionId: string | null;
  subject: string;
  body: string;
  /** Normalized communications source (SMS/WhatsApp/voicemail/etc.) */
  sourceType: WywoSourceType;
  sourceProvider: string | null;
  /** Provider message ids used to de-duplicate and to preserve threads across imports. */
  sourceMessageId: string | null;
  sourceThreadId: string | null;
  /** Platform-neutral threading ids for unified timeline rendering. */
  threadId: string | null;
  conversationId: string | null;
  /** AI/processing outputs (e.g. voicemail transcription, summaries). */
  transcription: string | null;
  aiSummary: string | null;
  sentiment: string | null;
  urgencyScore: number | null;
  senderName: string;
  senderPhone: string;
  senderEmail: string | null;
  senderUid: string | null;
  recipientName: string | null;
  recipientPhone: string;
  recipientEmail: string | null;
  recipientUid: string | null;
  ccRecipients: Array<{ phone: string; name?: string; email?: string }>;
  attachments: Array<{ name: string; mime?: string; sizeBytes?: number; url?: string }>;
  priority: string;
  category: string;
  urgent: boolean;
  readReceiptRequested: boolean;
  trustStatus: WywoTrustStatus;
  messageStatus: KeyraWywoMessage["messageStatus"];
  referralRequired: boolean;
  referralPhoneNumber: string | null;
  inviteToken: string | null;
  inviteStatus: KeyraWywoMessage["inviteStatus"];
  direction: "inbox" | "sent";
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deliveredAt: Date | null;
  readAt: Date | null;
  approvedAt: Date | null;
  blockedAt: Date | null;
  archivedAt: Date | null;
  parentMessageId: string | null;
};

export type WywoListResult = {
  total: number;
  items: WywoMessageView[];
};

export type {
  KeyraWywoAuditLog,
  KeyraWywoContactTrust,
  KeyraWywoInvite,
  KeyraWywoMessage,
  KeyraWywoWorld,
};

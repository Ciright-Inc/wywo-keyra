-- WYWO (While You Were Out) — trusted message layer for wywo.keyra.ie
-- Indexed against Ciright identity hierarchy + Keyra trust graph.

CREATE TYPE "WywoTrustStatus" AS ENUM (
  'TRUSTED','FAMILY_CIRCLE','EXECUTIVE_RING','REFERRED',
  'PENDING_REVIEW','UNKNOWN','BLOCKED','SUPPRESSED','EXPIRED','REVOKED'
);

CREATE TYPE "WywoTrustRing" AS ENUM (
  'FAMILY_CIRCLE','EXECUTIVE_RING','TRUSTED_CONTACTS',
  'REFERRED_CONTACTS','PENDING_UNKNOWNS','BLOCKED_ENTITIES'
);

CREATE TYPE "WywoMessageStatus" AS ENUM (
  'DRAFT','QUEUED','DELIVERED','READ','REPLIED','ARCHIVED','BLOCKED','EXPIRED'
);

CREATE TYPE "WywoInviteStatus" AS ENUM (
  'PENDING','SMS_SENT','CLICKED','VERIFIED','EXPIRED','REVOKED'
);

CREATE TYPE "WywoWorldType" AS ENUM (
  'PERSONAL','ENTERPRISE','SUBSCRIPTION','AGENT'
);

CREATE TABLE "keyra_wywo_worlds" (
  "id"                    TEXT NOT NULL,
  "worldId"               TEXT NOT NULL,
  "ownerPhoneE164"        TEXT NOT NULL,
  "ownerUid"              TEXT,
  "subscriptionId"        TEXT,
  "eid"                   TEXT,
  "keyraIdentityId"       TEXT,
  "worldType"             "WywoWorldType" NOT NULL DEFAULT 'PERSONAL',
  "name"                  TEXT NOT NULL,
  "company"               TEXT,
  "role"                  TEXT,
  "country"               TEXT,
  "preferredDevice"       TEXT,
  "notificationRulesJson" JSONB,
  "createdAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"             TIMESTAMP(3) NOT NULL,
  CONSTRAINT "keyra_wywo_worlds_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "keyra_wywo_worlds_worldId_key" ON "keyra_wywo_worlds"("worldId");
CREATE INDEX "keyra_wywo_worlds_ownerPhoneE164_idx" ON "keyra_wywo_worlds"("ownerPhoneE164");
CREATE INDEX "keyra_wywo_worlds_subscriptionId_idx" ON "keyra_wywo_worlds"("subscriptionId");
CREATE INDEX "keyra_wywo_worlds_eid_idx" ON "keyra_wywo_worlds"("eid");
CREATE INDEX "keyra_wywo_worlds_ownerUid_idx" ON "keyra_wywo_worlds"("ownerUid");

CREATE TABLE "keyra_wywo_messages" (
  "id"                   TEXT NOT NULL,
  "wywoMessageId"        TEXT NOT NULL,
  "subscriptionId"       TEXT,
  "eid"                  TEXT,
  "uid"                  TEXT,
  "worldId"              TEXT,
  "fromWorldId"          TEXT,
  "toWorldId"            TEXT,
  "senderUid"            TEXT,
  "senderKeyraId"        TEXT,
  "senderName"           TEXT NOT NULL,
  "senderPhone"          TEXT NOT NULL,
  "senderEmail"          TEXT,
  "recipientUid"         TEXT,
  "recipientKeyraId"     TEXT,
  "recipientName"        TEXT,
  "recipientPhone"       TEXT NOT NULL,
  "recipientEmail"       TEXT,
  "ccRecipientsJson"     JSONB,
  "subject"              TEXT NOT NULL,
  "bodyEncrypted"        TEXT NOT NULL,
  "bodyCryptoJson"       JSONB,
  "attachmentsJson"      JSONB,
  "priority"             TEXT NOT NULL DEFAULT 'normal',
  "category"             TEXT NOT NULL DEFAULT 'general',
  "urgent"               BOOLEAN NOT NULL DEFAULT false,
  "readReceiptRequested" BOOLEAN NOT NULL DEFAULT false,
  "expiresAt"            TIMESTAMP(3),
  "trustStatus"          "WywoTrustStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
  "messageStatus"        "WywoMessageStatus" NOT NULL DEFAULT 'QUEUED',
  "referralRequired"     BOOLEAN NOT NULL DEFAULT false,
  "referralPhoneNumber"  TEXT,
  "referralUid"          TEXT,
  "inviteToken"          TEXT,
  "inviteStatus"         "WywoInviteStatus",
  "createdAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"            TIMESTAMP(3) NOT NULL,
  "deliveredAt"          TIMESTAMP(3),
  "readAt"               TIMESTAMP(3),
  "approvedAt"           TIMESTAMP(3),
  "blockedAt"            TIMESTAMP(3),
  "archivedAt"           TIMESTAMP(3),
  "parentMessageId"      TEXT,
  CONSTRAINT "keyra_wywo_messages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "keyra_wywo_messages_wywoMessageId_key" ON "keyra_wywo_messages"("wywoMessageId");
CREATE INDEX "keyra_wywo_messages_senderPhone_idx" ON "keyra_wywo_messages"("senderPhone");
CREATE INDEX "keyra_wywo_messages_recipientPhone_idx" ON "keyra_wywo_messages"("recipientPhone");
CREATE INDEX "keyra_wywo_messages_trustStatus_idx" ON "keyra_wywo_messages"("trustStatus");
CREATE INDEX "keyra_wywo_messages_messageStatus_idx" ON "keyra_wywo_messages"("messageStatus");
CREATE INDEX "keyra_wywo_messages_worldId_idx" ON "keyra_wywo_messages"("worldId");
CREATE INDEX "keyra_wywo_messages_subscriptionId_idx" ON "keyra_wywo_messages"("subscriptionId");
CREATE INDEX "keyra_wywo_messages_createdAt_idx" ON "keyra_wywo_messages"("createdAt");
CREATE INDEX "keyra_wywo_messages_recipientPhone_trustStatus_idx" ON "keyra_wywo_messages"("recipientPhone","trustStatus");
CREATE INDEX "keyra_wywo_messages_senderPhone_createdAt_idx" ON "keyra_wywo_messages"("senderPhone","createdAt");

ALTER TABLE "keyra_wywo_messages"
  ADD CONSTRAINT "keyra_wywo_messages_parentMessageId_fkey"
  FOREIGN KEY ("parentMessageId") REFERENCES "keyra_wywo_messages"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "keyra_wywo_messages"
  ADD CONSTRAINT "keyra_wywo_messages_worldId_fkey"
  FOREIGN KEY ("worldId") REFERENCES "keyra_wywo_worlds"("worldId")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "keyra_wywo_contact_trust" (
  "id"             TEXT NOT NULL,
  "ownerPhoneE164" TEXT NOT NULL,
  "ownerUid"       TEXT,
  "contactPhone"   TEXT NOT NULL,
  "contactUid"     TEXT,
  "contactName"    TEXT,
  "contactEmail"   TEXT,
  "trustStatus"    "WywoTrustStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
  "trustRing"      "WywoTrustRing" NOT NULL DEFAULT 'PENDING_UNKNOWNS',
  "referralUid"    TEXT,
  "referralPhone"  TEXT,
  "approvedByUid"  TEXT,
  "notes"          TEXT,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL,
  CONSTRAINT "keyra_wywo_contact_trust_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "keyra_wywo_contact_trust_owner_contact_key"
  ON "keyra_wywo_contact_trust"("ownerPhoneE164","contactPhone");
CREATE INDEX "keyra_wywo_contact_trust_owner_ring_idx"
  ON "keyra_wywo_contact_trust"("ownerPhoneE164","trustRing");
CREATE INDEX "keyra_wywo_contact_trust_owner_status_idx"
  ON "keyra_wywo_contact_trust"("ownerPhoneE164","trustStatus");
CREATE INDEX "keyra_wywo_contact_trust_contactPhone_idx"
  ON "keyra_wywo_contact_trust"("contactPhone");

CREATE TABLE "keyra_wywo_invites" (
  "id"              TEXT NOT NULL,
  "inviteToken"     TEXT NOT NULL,
  "messageId"       TEXT NOT NULL,
  "senderUid"       TEXT,
  "senderPhoneE164" TEXT NOT NULL,
  "recipientPhone"  TEXT NOT NULL,
  "recipientName"   TEXT,
  "worldId"         TEXT,
  "subscriptionId"  TEXT,
  "status"          "WywoInviteStatus" NOT NULL DEFAULT 'PENDING',
  "smsSentAt"       TIMESTAMP(3),
  "clickedAt"       TIMESTAMP(3),
  "verifiedAt"      TIMESTAMP(3),
  "expiredAt"       TIMESTAMP(3),
  "expiresAt"       TIMESTAMP(3) NOT NULL,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL,
  CONSTRAINT "keyra_wywo_invites_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "keyra_wywo_invites_inviteToken_key" ON "keyra_wywo_invites"("inviteToken");
CREATE INDEX "keyra_wywo_invites_recipientPhone_idx" ON "keyra_wywo_invites"("recipientPhone");
CREATE INDEX "keyra_wywo_invites_status_idx" ON "keyra_wywo_invites"("status");
CREATE INDEX "keyra_wywo_invites_senderPhoneE164_idx" ON "keyra_wywo_invites"("senderPhoneE164");

ALTER TABLE "keyra_wywo_invites"
  ADD CONSTRAINT "keyra_wywo_invites_messageId_fkey"
  FOREIGN KEY ("messageId") REFERENCES "keyra_wywo_messages"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "keyra_wywo_invites"
  ADD CONSTRAINT "keyra_wywo_invites_worldId_fkey"
  FOREIGN KEY ("worldId") REFERENCES "keyra_wywo_worlds"("worldId")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "keyra_wywo_audit_log" (
  "id"           TEXT NOT NULL,
  "messageId"    TEXT,
  "actorUid"     TEXT,
  "actorPhone"   TEXT,
  "action"       TEXT NOT NULL,
  "oldValueJson" JSONB,
  "newValueJson" JSONB,
  "ipAddress"    TEXT,
  "deviceId"     TEXT,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "keyra_wywo_audit_log_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "keyra_wywo_audit_log_messageId_idx" ON "keyra_wywo_audit_log"("messageId");
CREATE INDEX "keyra_wywo_audit_log_actorPhone_idx" ON "keyra_wywo_audit_log"("actorPhone");
CREATE INDEX "keyra_wywo_audit_log_createdAt_idx" ON "keyra_wywo_audit_log"("createdAt");
CREATE INDEX "keyra_wywo_audit_log_action_idx" ON "keyra_wywo_audit_log"("action");

ALTER TABLE "keyra_wywo_audit_log"
  ADD CONSTRAINT "keyra_wywo_audit_log_messageId_fkey"
  FOREIGN KEY ("messageId") REFERENCES "keyra_wywo_messages"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

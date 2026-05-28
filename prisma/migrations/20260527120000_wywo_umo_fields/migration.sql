-- WYWO Unified Message Object (UMO) — cross-channel normalization fields

CREATE TYPE "WywoSourceType" AS ENUM (
  'WYWO_NATIVE',
  'SMS',
  'WHATSAPP',
  'VOICEMAIL',
  'IMESSAGE_IMPORT',
  'OUTLOOK',
  'CALENDAR_ALERT',
  'TEAMS',
  'CRM',
  'SUPPORT_TICKET',
  'ENTERPRISE_ALERT',
  'AI_AGENT'
);

ALTER TABLE "keyra_wywo_messages" ADD COLUMN IF NOT EXISTS "sourceType" "WywoSourceType" NOT NULL DEFAULT 'WYWO_NATIVE';
ALTER TABLE "keyra_wywo_messages" ADD COLUMN IF NOT EXISTS "sourceProvider" TEXT;
ALTER TABLE "keyra_wywo_messages" ADD COLUMN IF NOT EXISTS "sourceMessageId" TEXT;
ALTER TABLE "keyra_wywo_messages" ADD COLUMN IF NOT EXISTS "sourceThreadId" TEXT;
ALTER TABLE "keyra_wywo_messages" ADD COLUMN IF NOT EXISTS "senderEmail" TEXT;
ALTER TABLE "keyra_wywo_messages" ADD COLUMN IF NOT EXISTS "senderIdentity" TEXT;
ALTER TABLE "keyra_wywo_messages" ADD COLUMN IF NOT EXISTS "recipientIdentity" TEXT;
ALTER TABLE "keyra_wywo_messages" ADD COLUMN IF NOT EXISTS "threadId" TEXT;
ALTER TABLE "keyra_wywo_messages" ADD COLUMN IF NOT EXISTS "conversationId" TEXT;
ALTER TABLE "keyra_wywo_messages" ADD COLUMN IF NOT EXISTS "transcription" TEXT;
ALTER TABLE "keyra_wywo_messages" ADD COLUMN IF NOT EXISTS "aiSummary" TEXT;
ALTER TABLE "keyra_wywo_messages" ADD COLUMN IF NOT EXISTS "sentiment" TEXT;
ALTER TABLE "keyra_wywo_messages" ADD COLUMN IF NOT EXISTS "urgencyScore" DOUBLE PRECISION;
ALTER TABLE "keyra_wywo_messages" ADD COLUMN IF NOT EXISTS "deviceTargetsJson" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "keyra_wywo_messages" ADD COLUMN IF NOT EXISTS "routingPolicyJson" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "keyra_wywo_messages" ADD COLUMN IF NOT EXISTS "calendarReferenceJson" JSONB;
ALTER TABLE "keyra_wywo_messages" ADD COLUMN IF NOT EXISTS "crmReferenceJson" JSONB;
ALTER TABLE "keyra_wywo_messages" ADD COLUMN IF NOT EXISTS "taskReferenceJson" JSONB;

CREATE INDEX IF NOT EXISTS "keyra_wywo_messages_sourceType_idx" ON "keyra_wywo_messages"("sourceType");
CREATE INDEX IF NOT EXISTS "keyra_wywo_messages_threadId_idx" ON "keyra_wywo_messages"("threadId");
CREATE INDEX IF NOT EXISTS "keyra_wywo_messages_conversationId_idx" ON "keyra_wywo_messages"("conversationId");

-- Align WYWO tables with Prisma schema (idempotent, safe on shared Postgres).
-- Fixes column-name drift from older db push attempts and adds optional Prisma fields.

-- keyra_wywo_worlds: rename mistaken db-push column names → migration SQL names
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'keyra_wywo_worlds' AND column_name = 'phoneE164'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'keyra_wywo_worlds' AND column_name = 'ownerPhoneE164'
  ) THEN
    ALTER TABLE "keyra_wywo_worlds" RENAME COLUMN "phoneE164" TO "ownerPhoneE164";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'keyra_wywo_worlds' AND column_name = 'uid'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'keyra_wywo_worlds' AND column_name = 'ownerUid'
  ) THEN
    ALTER TABLE "keyra_wywo_worlds" RENAME COLUMN "uid" TO "ownerUid";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'keyra_wywo_worlds' AND column_name = 'displayName'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'keyra_wywo_worlds' AND column_name = 'name'
  ) THEN
    ALTER TABLE "keyra_wywo_worlds" RENAME COLUMN "displayName" TO "name";
  END IF;
END $$;

ALTER TABLE "keyra_wywo_worlds" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "keyra_wywo_worlds" ADD COLUMN IF NOT EXISTS "keyraIdentityId" TEXT;

-- keyra_wywo_messages: optional Prisma-only columns + read-receipt / expiry name fixes
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'keyra_wywo_messages' AND column_name = 'readReceipt'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'keyra_wywo_messages' AND column_name = 'readReceiptRequested'
  ) THEN
    ALTER TABLE "keyra_wywo_messages" RENAME COLUMN "readReceipt" TO "readReceiptRequested";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'keyra_wywo_messages' AND column_name = 'expirationAt'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'keyra_wywo_messages' AND column_name = 'expiresAt'
  ) THEN
    ALTER TABLE "keyra_wywo_messages" RENAME COLUMN "expirationAt" TO "expiresAt";
  END IF;
END $$;

ALTER TABLE "keyra_wywo_messages" ADD COLUMN IF NOT EXISTS "keyraIdentityId" TEXT;
ALTER TABLE "keyra_wywo_messages" ADD COLUMN IF NOT EXISTS "replyPermitted" BOOLEAN NOT NULL DEFAULT true;

-- keyra_wywo_contact_trust
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'keyra_wywo_contact_trust' AND column_name = 'ownerPhone'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'keyra_wywo_contact_trust' AND column_name = 'ownerPhoneE164'
  ) THEN
    ALTER TABLE "keyra_wywo_contact_trust" RENAME COLUMN "ownerPhone" TO "ownerPhoneE164";
  END IF;
END $$;

-- keyra_wywo_invites
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'keyra_wywo_invites' AND column_name = 'senderPhone'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'keyra_wywo_invites' AND column_name = 'senderPhoneE164'
  ) THEN
    ALTER TABLE "keyra_wywo_invites" RENAME COLUMN "senderPhone" TO "senderPhoneE164";
  END IF;
END $$;

-- keyra_wywo_audit_log
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'keyra_wywo_audit_log' AND column_name = 'oldValue'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'keyra_wywo_audit_log' AND column_name = 'oldValueJson'
  ) THEN
    ALTER TABLE "keyra_wywo_audit_log" RENAME COLUMN "oldValue" TO "oldValueJson";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'keyra_wywo_audit_log' AND column_name = 'newValue'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'keyra_wywo_audit_log' AND column_name = 'newValueJson'
  ) THEN
    ALTER TABLE "keyra_wywo_audit_log" RENAME COLUMN "newValue" TO "newValueJson";
  END IF;
END $$;

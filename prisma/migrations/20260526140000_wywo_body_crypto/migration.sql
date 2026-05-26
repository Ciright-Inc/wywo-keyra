-- Optional column for encrypted body metadata (not in original WYWO tables).
ALTER TABLE "keyra_wywo_messages"
  ADD COLUMN IF NOT EXISTS "bodyCryptoJson" JSONB;

-- Align DB enums with Prisma schema for WYWO.
--
-- Postgres does NOT allow ALTER TYPE ... ADD VALUE inside a multi-statement
-- transaction. Each statement is therefore guarded with `IF NOT EXISTS` and
-- runs independently so re-running the migration is a no-op.

ALTER TYPE "WywoMessageStatus" ADD VALUE IF NOT EXISTS 'REPLIED';
ALTER TYPE "WywoWorldType"     ADD VALUE IF NOT EXISTS 'AGENT';

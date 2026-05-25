-- Fix: permission denied for table (42501) when DATABASE_URL uses role `keyra`
-- but migrations were run as another OS user (table owner).
--
-- Run once as a superuser or table owner:
--   psql "$DATABASE_URL" -f scripts/grant-keyra-db-permissions.sql
-- Or locally:
--   psql postgresql://localhost:5432/keyra -f scripts/grant-keyra-db-permissions.sql

GRANT USAGE ON SCHEMA public TO keyra;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO keyra;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO keyra;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO keyra;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO keyra;

-- SOIP schema (if present on shared Postgres)
GRANT USAGE ON SCHEMA keyra_soip TO keyra;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA keyra_soip TO keyra;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA keyra_soip TO keyra;

ALTER DEFAULT PRIVILEGES IN SCHEMA keyra_soip
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO keyra;
ALTER DEFAULT PRIVILEGES IN SCHEMA keyra_soip
  GRANT USAGE, SELECT ON SEQUENCES TO keyra;

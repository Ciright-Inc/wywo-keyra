#!/usr/bin/env node
/**
 * WYWO database setup for Railway / shared Postgres.
 *
 * - Never calls `prisma migrate deploy` (P3005 on shared DBs).
 * - Never calls `prisma db push` (would DROP unrelated tables).
 * - Runs SQL via the `pg` driver + DATABASE_URL (no Prisma CLI; works when
 *   Railway installs with --omit=dev and without --schema/--url CLI quirks).
 * - Never blocks container start on failure (avoids Railway restart loops).
 */
import { readFileSync } from "node:fs";
import { basename, join } from "node:path";
import pg from "pg";
import { PrismaClient } from "@prisma/client";

const { Client } = pg;
const ROOT = process.cwd();
const WYWO_SQL_FILES = [
  "prisma/migrations/20260526120000_wywo_messaging/migration.sql",
  "prisma/migrations/20260526140000_wywo_body_crypto/migration.sql",
  "prisma/migrations/20260526150000_wywo_enum_align/migration.sql",
  "prisma/migrations/20260527120000_wywo_umo_fields/migration.sql",
  "prisma/migrations/20260528170000_wywo_prisma_column_align/migration.sql",
];
const UMO_SQL = "prisma/migrations/20260527120000_wywo_umo_fields/migration.sql";
const ALIGN_SQL = WYWO_SQL_FILES[WYWO_SQL_FILES.length - 1];

const BENIGN_SQL =
  /already exists|duplicate key|duplicate_object|42710|42P07|42P06|42701/i;

function databaseUrl() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) throw new Error("DATABASE_URL is not set");
  return url;
}

/** Run a migration file as one Postgres script (supports DO $$ … $$ blocks). */
async function executeSqlFile(relPath) {
  const abs = join(ROOT, relPath);
  const label = basename(relPath);
  const sql = readFileSync(abs, "utf8");
  if (!sql.trim()) {
    console.log(`[wywo-db]   · ${label} (empty, skipped)`);
    return;
  }

  console.log(`[wywo-db]   applying ${label}…`);
  const client = new Client({ connectionString: databaseUrl() });
  await client.connect();
  try {
    await client.query(sql);
    console.log(`[wywo-db]   ✓ ${label}`);
  } catch (err) {
    const msg = `${err?.message ?? err}`;
    if (BENIGN_SQL.test(msg)) {
      console.log(`[wywo-db]   · ${label} (already present, continuing)`);
      return;
    }
    throw err;
  } finally {
    await client.end();
  }
}

async function wywoTablesExist(prisma) {
  const rows = await prisma.$queryRaw`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'keyra_wywo_messages'
    ) AS ok
  `;
  return Boolean(rows[0]?.ok);
}

async function wywoSchemaAligned(prisma) {
  const rows = await prisma.$queryRaw`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'keyra_wywo_worlds'
        AND column_name = 'ownerPhoneE164'
    ) AS ok
  `;
  return Boolean(rows[0]?.ok);
}

async function wywoUmoColumnsExist(prisma) {
  const rows = await prisma.$queryRaw`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'keyra_wywo_messages'
        AND column_name = 'sourceType'
    ) AS ok
  `;
  return Boolean(rows[0]?.ok);
}

async function keyraCatalogTablesExist(prisma) {
  const rows = await prisma.$queryRaw`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'Region'
    ) AS ok
  `;
  return Boolean(rows[0]?.ok);
}

async function ensureWywoSchema() {
  databaseUrl();

  const prisma = new PrismaClient();
  try {
    const tablesExist = await wywoTablesExist(prisma);
    const aligned = tablesExist ? await wywoSchemaAligned(prisma) : false;
    const umoReady = tablesExist ? await wywoUmoColumnsExist(prisma) : false;

    if (tablesExist && aligned && umoReady) {
      console.log("[wywo-db] WYWO schema OK — no SQL needed.\n");
      return;
    }

    if (tablesExist) {
      if (!umoReady) {
        console.log("[wywo-db] WYWO UMO columns missing — applying UMO migration…\n");
        await executeSqlFile(UMO_SQL);
      }
      if (!aligned) {
        console.log("[wywo-db] WYWO columns out of date — applying align migration…\n");
        await executeSqlFile(ALIGN_SQL);
      }
      const nowAligned = await wywoSchemaAligned(prisma);
      const nowUmo = await wywoUmoColumnsExist(prisma);
      console.log(
        nowAligned && nowUmo
          ? "[wywo-db] WYWO schema updated.\n"
          : `[wywo-db] WARN: schema still incomplete (aligned=${nowAligned}, umo=${nowUmo}).\n`,
      );
      return;
    }

    console.log("[wywo-db] WYWO tables missing — applying all WYWO SQL…\n");
    for (const file of WYWO_SQL_FILES) {
      await executeSqlFile(file);
    }
    console.log("[wywo-db] WYWO schema ready.\n");
  } finally {
    await prisma.$disconnect();
  }
}

async function maybeSeedCatalog() {
  if (process.env.SKIP_DEPLOY_CATALOG_SEED === "1") {
    console.log("[wywo-db] Catalog seed skipped (SKIP_DEPLOY_CATALOG_SEED=1).\n");
    return;
  }

  const prisma = new PrismaClient();
  try {
    if (!(await keyraCatalogTablesExist(prisma))) {
      console.log(
        "[wywo-db] Keyra catalog tables (Region) not in this database — skipping catalog seed.\n",
      );
      return;
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log("[wywo-db] Running deploy catalog seed…\n");
  const { execSync } = await import("node:child_process");
  try {
    execSync("npm run db:seed:deploy-catalog", {
      cwd: ROOT,
      stdio: "inherit",
      env: process.env,
    });
  } catch (err) {
    console.warn("[wywo-db] Catalog seed failed (non-blocking):", err?.message ?? err);
  }
  console.log("");
}

async function main() {
  console.log("[wywo-db] Checking database (pg driver)…\n");
  await ensureWywoSchema();
  await maybeSeedCatalog();
  console.log("[wywo-db] Done.\n");
}

main().catch((err) => {
  console.error("[wywo-db] Setup error (non-blocking, app will still start):", err?.message ?? err);
  process.exit(0);
});

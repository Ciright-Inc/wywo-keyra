#!/usr/bin/env node
/**
 * WYWO database setup for Railway / shared Postgres.
 *
 * Does NOT call `prisma migrate deploy` (P3005 on shared DBs with other apps' tables).
 * Does NOT call `prisma db push` (would try to DROP unrelated tables).
 *
 * 1. If `keyra_wywo_messages` exists → done (fast path, every redeploy).
 * 2. Else → run only the 3 WYWO migration SQL files via `prisma db execute`.
 * 3. Optionally seed deploy catalog when Keyra catalog tables exist.
 */
import { execSync } from "node:child_process";
import { basename, join } from "node:path";
import { PrismaClient } from "@prisma/client";

const ROOT = process.cwd();
const WYWO_SQL_FILES = [
  "prisma/migrations/20260526120000_wywo_messaging/migration.sql",
  "prisma/migrations/20260526140000_wywo_body_crypto/migration.sql",
  "prisma/migrations/20260526150000_wywo_enum_align/migration.sql",
  "prisma/migrations/20260528170000_wywo_prisma_column_align/migration.sql",
];

function run(cmd, { inherit = false, input } = {}) {
  const opts = { stdio: inherit ? "inherit" : "pipe", encoding: "utf8", env: process.env };
  if (input !== undefined) opts.input = input;
  if (inherit) {
    execSync(cmd, opts);
    return "";
  }
  return execSync(cmd, opts);
}

function runSqlFile(relPath) {
  const abs = join(ROOT, relPath);
  const label = basename(relPath);
  try {
    console.log(`[wywo-db]   applying ${label}…`);
    run(`npx prisma db execute --file "${abs}"`, { inherit: true });
    console.log(`[wywo-db]   ✓ ${label}`);
  } catch (err) {
    const msg = `${err.stdout ?? ""}\n${err.stderr ?? ""}\n${err.message ?? ""}`;
    if (/already exists|duplicate key|duplicate_object/i.test(msg)) {
      console.log(`[wywo-db]   · ${label} (already present, continuing)`);
      return;
    }
    console.error(msg);
    throw err;
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

/** True when worlds table has the column Prisma expects (not old db-push `phoneE164`). */
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
  const prisma = new PrismaClient();
  try {
    const tablesExist = await wywoTablesExist(prisma);
    const aligned = tablesExist ? await wywoSchemaAligned(prisma) : false;

    if (tablesExist && aligned) {
      console.log("[wywo-db] WYWO schema aligned — running column-align SQL only.\n");
      runSqlFile(WYWO_SQL_FILES[WYWO_SQL_FILES.length - 1]);
      console.log("");
      return;
    }

    if (tablesExist && !aligned) {
      console.log(
        "[wywo-db] WYWO tables present but columns out of date — applying align migration…\n",
      );
      runSqlFile(WYWO_SQL_FILES[WYWO_SQL_FILES.length - 1]);
      console.log("\n[wywo-db] WYWO column align done.\n");
      return;
    }

    console.log("[wywo-db] WYWO tables missing — applying WYWO SQL only (shared-DB safe)…\n");
    for (const file of WYWO_SQL_FILES) {
      runSqlFile(file);
    }
    console.log("\n[wywo-db] WYWO schema ready.\n");
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
        "[wywo-db] Keyra catalog tables (Region) not in this database — skipping catalog seed.\n" +
          "         (normal on a WYWO-only / shared Postgres without the full Keyra schema.)\n",
      );
      return;
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log("[wywo-db] Running deploy catalog seed…\n");
  run("npm run db:seed:deploy-catalog", { inherit: true });
  console.log("");
}

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error("[wywo-db] DATABASE_URL is not set.");
    process.exit(1);
  }

  console.log("[wywo-db] Checking database…\n");
  await ensureWywoSchema();
  await maybeSeedCatalog();
}

main().catch((err) => {
  console.error("[wywo-db] FATAL:", err);
  process.exit(1);
});

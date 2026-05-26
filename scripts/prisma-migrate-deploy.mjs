#!/usr/bin/env node
/**
 * Production migration runner for Railway / Docker.
 *
 * Normal path: `prisma migrate deploy`
 *
 * P3005 ("database schema is not empty") happens when Postgres already has
 * tables from another service (shared Railway DB) but no _prisma_migrations
 * history for this app. NEVER use `db push` here — it tries to DROP tables
 * that belong to other apps (developer, auth, translate, etc.).
 *
 * Safe P3005 handling:
 *   1. Mark every non-WYWO migration as already applied (baseline only).
 *   2. Run `migrate deploy` — applies only the WYWO migration SQL files.
 */
import { execSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join } from "node:path";

const MIGRATIONS_DIR = join(process.cwd(), "prisma", "migrations");

/** WYWO-only migrations — the only SQL we actually run on a shared database. */
const WYWO_MIGRATIONS = new Set([
  "20260526120000_wywo_messaging",
  "20260526140000_wywo_body_crypto",
  "20260526150000_wywo_enum_align",
]);

function run(cmd, { inherit = false } = {}) {
  if (inherit) {
    execSync(cmd, { stdio: "inherit", env: process.env });
    return "";
  }
  return execSync(cmd, { encoding: "utf8", env: process.env });
}

function listMigrationNames() {
  return readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}

function tryMigrateDeploy() {
  try {
    const out = run("npx prisma migrate deploy");
    if (out) process.stdout.write(out);
    return true;
  } catch (err) {
    const msg = `${err.stdout ?? ""}\n${err.stderr ?? ""}\n${err.message ?? ""}`;
    process.stdout.write(msg);
    if (msg.includes("P3005")) return false;
    throw err;
  }
}

function resolveApplied(name) {
  try {
    run(`npx prisma migrate resolve --applied "${name}"`);
    return "applied";
  } catch (err) {
    const msg = String(err.stderr ?? err.stdout ?? err.message ?? "");
    if (msg.includes("P3008") || msg.includes("already")) return "exists";
    console.warn(`[prisma]   ! resolve ${name}: ${msg.trim()}`);
    return "error";
  }
}

/**
 * Shared-database baseline: do NOT db push. Only apply WYWO migration files.
 */
function baselineSharedDatabase() {
  console.log("\n[prisma] P3005 — database already has tables (likely a shared Postgres).");
  console.log("[prisma] NOT running db push (that would drop other apps' tables).");
  console.log("[prisma] Baselining non-WYWO migrations, then applying WYWO only.\n");

  const names = listMigrationNames();
  for (const name of names) {
    if (WYWO_MIGRATIONS.has(name)) continue;
    const status = resolveApplied(name);
    console.log(`[prisma]   · baselined (skipped SQL): ${name}${status === "exists" ? " [already]" : ""}`);
  }

  console.log("\n[prisma] Applying WYWO migrations via migrate deploy…\n");
  run("npx prisma migrate deploy", { inherit: true });
}

console.log("[prisma] migrate deploy…\n");
if (!tryMigrateDeploy()) {
  baselineSharedDatabase();
}
console.log("\n[prisma] migrations OK.\n");

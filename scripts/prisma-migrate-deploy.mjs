#!/usr/bin/env node
/**
 * Production migration runner for Railway / Docker.
 *
 * Handles Prisma P3005 ("database schema is not empty") which happens when
 * Postgres already has tables (e.g. from an earlier `db push` or manual setup)
 * but no `_prisma_migrations` history. In that case we:
 *   1. `db push` — ensure schema matches prisma/schema.prisma (adds WYWO tables etc.)
 *   2. `migrate resolve --applied` for every migration folder — baseline history
 *   3. `migrate deploy` — apply any migrations still missing from the DB
 */
import { execSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join } from "node:path";

const MIGRATIONS_DIR = join(process.cwd(), "prisma", "migrations");

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

function baselineExistingDatabase() {
  console.log("\n[prisma] P3005 — database has schema but no migration history.");
  console.log("[prisma] Syncing schema with db push, then baselining migrations…\n");

  run("npx prisma db push --skip-generate", { inherit: true });

  const names = listMigrationNames();
  for (const name of names) {
    try {
      run(`npx prisma migrate resolve --applied "${name}"`);
      console.log(`[prisma]   ✓ baselined ${name}`);
    } catch (err) {
      const msg = String(err.stderr ?? err.stdout ?? err.message ?? "");
      // Already recorded — safe to ignore on redeploy.
      if (msg.includes("already") || msg.includes("P3008")) {
        console.log(`[prisma]   · already applied ${name}`);
      } else {
        console.warn(`[prisma]   ! resolve ${name}: ${msg.trim()}`);
      }
    }
  }

  console.log("\n[prisma] Running migrate deploy after baseline…\n");
  run("npx prisma migrate deploy", { inherit: true });
}

console.log("[prisma] migrate deploy…\n");
if (!tryMigrateDeploy()) {
  baselineExistingDatabase();
}
console.log("\n[prisma] migrations OK.\n");

/**
 * Apply Keyra Prisma migration SQL files to simsecure_auth (additive only).
 * Skips files that error (e.g. table/type already exists).
 */
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const migrationsDir = join(root, "prisma", "migrations");

function runExecute(file) {
  return new Promise((resolve) => {
    const child = spawn(
      "npx",
      ["prisma", "db", "execute", "--schema", "prisma/schema.prisma", "--file", file],
      { cwd: root, shell: true, stdio: "pipe", env: process.env },
    );
    let out = "";
    child.stdout?.on("data", (d) => { out += d; });
    child.stderr?.on("data", (d) => { out += d; });
    child.on("close", (code) => resolve({ code, out }));
  });
}

const dirs = (await readdir(migrationsDir, { withFileTypes: true }))
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

for (const dir of dirs) {
  const sqlPath = join(migrationsDir, dir, "migration.sql");
  try {
    await readFile(sqlPath);
  } catch {
    continue;
  }
  const rel = `prisma/migrations/${dir}/migration.sql`;
  process.stdout.write(`Applying ${dir}…\n`);
  const { code, out } = await runExecute(rel);
  if (code === 0) {
    process.stdout.write(`  OK\n`);
  } else {
    process.stdout.write(`  Skipped (${code}): ${out.split("\n").slice(-3).join(" ")}\n`);
  }
}

process.stdout.write("Done.\n");

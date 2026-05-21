import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { TelcoCatalogRow } from "./telcoCatalogTypes";

export const KEYRA_TELCOS_CATALOG_JSON = join(process.cwd(), "prisma", "data", "keyra-telcos-catalog.json");

export type KeyraTelcosCatalogFile = {
  version: number;
  source: string;
  rowCount: number;
  telcos: TelcoCatalogRow[];
};

export function loadKeyraTelcosCatalog(catalogPath = KEYRA_TELCOS_CATALOG_JSON): TelcoCatalogRow[] {
  const raw = readFileSync(catalogPath, "utf8");
  const parsed = JSON.parse(raw) as KeyraTelcosCatalogFile;
  if (!Array.isArray(parsed.telcos)) {
    throw new Error(`[loadKeyraTelcosCatalog] Invalid catalog file: ${catalogPath}`);
  }
  return parsed.telcos;
}

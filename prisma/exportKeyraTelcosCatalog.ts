/**
 * Regenerate `prisma/data/keyra-telcos-catalog.json` from the Excel source.
 * Run after updating `Telco details for Keyra.xlsx`, then commit the JSON.
 *
 * Usage: npm run db:export:telcos-catalog
 *        npm run db:export:telcos-catalog -- /path/to/file.xlsx
 */
import { writeFileSync } from "node:fs";
import { KEYRA_TELCOS_CATALOG_JSON } from "./loadKeyraTelcosCatalog";
import { defaultTelcoXlsxPath, parseKeyraTelcoXlsx } from "./parseKeyraTelcoXlsx";

const runStandalone = typeof process !== "undefined" && process.argv[1]?.includes("exportKeyraTelcosCatalog");
if (runStandalone) {
  const xlsxPath = process.argv[2]?.trim() || defaultTelcoXlsxPath();
  const telcos = parseKeyraTelcoXlsx(xlsxPath);
  const payload = {
    version: 1,
    source: "Telco details for Keyra.xlsx",
    rowCount: telcos.length,
    telcos,
  };
  writeFileSync(KEYRA_TELCOS_CATALOG_JSON, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.info("[exportKeyraTelcosCatalog]", { xlsxPath, out: KEYRA_TELCOS_CATALOG_JSON, rowCount: telcos.length });
}

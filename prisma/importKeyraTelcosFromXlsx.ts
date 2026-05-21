/**
 * Import telco operators from `Telco details for Keyra.xlsx` and remove
 * placeholder "National carriers (catalog)" rows from the admin catalog.
 *
 * Usage: npm run db:import:telcos
 *        npm run db:import:telcos -- /path/to/file.xlsx
 */
import { PrismaClient } from "@prisma/client";
import { importKeyraTelcos } from "./importKeyraTelcos";
import { defaultTelcoXlsxPath, parseKeyraTelcoXlsx } from "./parseKeyraTelcoXlsx";

export { importKeyraTelcos, importKeyraTelcosFromCatalog, type ImportKeyraTelcosStats } from "./importKeyraTelcos";

export async function importKeyraTelcosFromXlsx(prisma: PrismaClient, xlsxPath: string) {
  const rows = parseKeyraTelcoXlsx(xlsxPath);
  return importKeyraTelcos(prisma, rows, "Telco details for Keyra.xlsx");
}

const runStandalone = typeof process !== "undefined" && process.argv[1]?.includes("importKeyraTelcosFromXlsx");
if (runStandalone) {
  async function main() {
    const xlsxPath = process.argv[2]?.trim() || defaultTelcoXlsxPath();
    const prisma = new PrismaClient();
    try {
      const stats = await importKeyraTelcosFromXlsx(prisma, xlsxPath);
      console.info("[importKeyraTelcosFromXlsx]", { xlsxPath, ...stats });
    } finally {
      await prisma.$disconnect();
    }
  }
  void main().catch((e) => {
    console.error("[importKeyraTelcosFromXlsx]", e);
    process.exit(1);
  });
}

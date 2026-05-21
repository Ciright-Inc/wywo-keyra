/**
 * Upsert telco operators from catalog rows and remove placeholder
 * "National carriers (catalog)" rows from the admin catalog.
 */
import { DeploymentStatus, PrismaClient } from "@prisma/client";
import { loadKeyraTelcosCatalog } from "./loadKeyraTelcosCatalog";
import type { TelcoCatalogRow } from "./telcoCatalogTypes";

const PLACEHOLDER_TELCO_SLUG = "national-carriers";

export type ImportKeyraTelcosStats = {
  rowsParsed: number;
  upserted: number;
  skippedMissingCountry: number;
  placeholdersRemoved: number;
  sourceLabel: string;
};

export async function importKeyraTelcos(
  prisma: PrismaClient,
  rows: TelcoCatalogRow[],
  sourceLabel: string,
): Promise<ImportKeyraTelcosStats> {
  const countries = await prisma.countryDeployment.findMany({
    select: { id: true, iso2: true, name: true },
  });
  const countryByIso2 = new Map(countries.map((c) => [c.iso2.toUpperCase(), c]));

  let upserted = 0;
  let skippedMissingCountry = 0;
  let sortOrder = 0;

  for (const row of rows) {
    const country = countryByIso2.get(row.countryIso2.toUpperCase());
    if (!country) {
      skippedMissingCountry++;
      console.warn(`[importKeyraTelcos] Skipping ${row.name} — no country for ISO2 ${row.countryIso2}`);
      continue;
    }

    sortOrder += 1;
    await prisma.telcoDeployment.upsert({
      where: {
        countryId_slug: {
          countryId: country.id,
          slug: row.slug,
        },
      },
      create: {
        countryId: country.id,
        name: row.name,
        slug: row.slug,
        subscribers: row.subscribers,
        subscribersDisplay: row.subscribersDisplay,
        telcoSubdomain: row.telcoSubdomain,
        officialDomain: row.officialDomain,
        status: DeploymentStatus.IDENTIFIED,
        statusNote: `Imported from ${sourceLabel}`,
        sourceLabel,
        sourceUrl: null,
        sourceVerifiedAt: new Date(),
        sortOrder,
        isPublished: false,
      },
      update: {
        name: row.name,
        subscribers: row.subscribers,
        subscribersDisplay: row.subscribersDisplay,
        telcoSubdomain: row.telcoSubdomain,
        officialDomain: row.officialDomain,
        statusNote: `Imported from ${sourceLabel}`,
        sourceLabel,
        sourceVerifiedAt: new Date(),
        sortOrder,
      },
    });
    upserted++;
  }

  const removed = await prisma.telcoDeployment.deleteMany({
    where: { slug: PLACEHOLDER_TELCO_SLUG },
  });

  return {
    rowsParsed: rows.length,
    upserted,
    skippedMissingCountry,
    placeholdersRemoved: removed.count,
    sourceLabel,
  };
}

export async function importKeyraTelcosFromCatalog(prisma: PrismaClient): Promise<ImportKeyraTelcosStats> {
  const rows = loadKeyraTelcosCatalog();
  return importKeyraTelcos(prisma, rows, "keyra-telcos-catalog.json");
}
